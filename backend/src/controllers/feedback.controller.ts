import { Request, Response } from 'express';
import Feedback from '../models/feedback.model';
import { analyzeFeedback, generateWeeklySummary } from '../services/gemini.service';
import { sendSuccess, sendError } from '../utils/response';

//submit feedback
export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, submitterName, submitterEmail } = req.body;
    const feedback = new Feedback({
      title, description, category,
      submitterName: submitterName || undefined,
      submitterEmail: submitterEmail || undefined,
    });
    await feedback.save();

    sendSuccess(res, feedback, 'Feedback submitted! Our AI is analysing it in the background.', 201);

    // Run AI asynchronously — feedback already saved regardless
    (async () => {
      try {
        const analysis = await analyzeFeedback(title, description);
        await Feedback.findByIdAndUpdate(feedback._id, {
          ai_category: analysis.category,
          ai_sentiment: analysis.sentiment,
          ai_priority: analysis.priority_score,
          ai_summary: analysis.summary,
          ai_tags: analysis.tags,
          ai_processed: true,
        });
        console.log(`AI done for: ${feedback._id}`);
      } catch (err) {
        console.error(`AI failed for ${feedback._id}:`, err);
      }
    })();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ValidationError') {
      // Prefer the first field-level validation message for clearer client feedback
      const validationErrors = (error as any).errors;
      const firstMessage = validationErrors
        ? (Object.values(validationErrors)[0] as { message?: string })?.message
        : undefined;
      const message = typeof firstMessage === 'string' ? firstMessage : error.message;
      sendError(res, message, 400);
    } else {
      sendError(res, 'Failed to submit feedback.', 500);
    }
  }
};

//get all feedback by admin
export const getAllFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    //pagination
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;
    //filtering
    const filter: Record<string, unknown> = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) filter.$text = { $search: req.query.search };
    //sorting
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (req.query.sort === 'priority') sortOption = { ai_priority: -1 };
    else if (req.query.sort === 'sentiment') sortOption = { ai_sentiment: 1, createdAt: -1 };
    
    const [feedbackList, total] = await Promise.all([
      Feedback.find(filter).sort(sortOption).skip(skip).limit(limit),
      Feedback.countDocuments(filter),
    ]);

    sendSuccess(res, feedbackList, `Retrieved ${feedbackList.length} items`, 200, {
      page, limit, total, totalPages: Math.ceil(total / limit),
    });
  } catch {
    sendError(res, 'Failed to retrieve feedback', 500);
  }
};
//get feedback stats for dashboard
export const getFeedbackStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [total, openItems, priorityAgg, tagAgg] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: { $ne: 'Resolved' } }),
      Feedback.aggregate([{ $match: { ai_priority: { $exists: true } } }, { $group: { _id: null, avg: { $avg: '$ai_priority' } } }]),
      Feedback.aggregate([{ $unwind: '$ai_tags' }, { $group: { _id: '$ai_tags', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 1 }]),
    ]);
    sendSuccess(res, {
      total,
      openItems,
      avgPriority: priorityAgg[0]?.avg ? Math.round(priorityAgg[0].avg * 10) / 10 : null,
      mostCommonTag: tagAgg[0]?._id || null,
    });
  } catch {
    sendError(res, 'Failed to retrieve stats', 500);
  }
};
//get weekly AI summary of recent feedback for admin dashboard
export const getAISummary = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = await Feedback.find({ createdAt: { $gte: sevenDaysAgo }, ai_processed: true })
      .select('title description ai_tags ai_sentiment');
    if (recent.length === 0) { sendSuccess(res, { message: 'No processed feedback in the last 7 days' }); return; }
    const summary = await generateWeeklySummary(recent.map(f => ({ title: f.title, description: f.description, ai_tags: f.ai_tags, ai_sentiment: f.ai_sentiment })));
    sendSuccess(res, summary, 'Weekly AI summary generated');
  } catch (err) {
    console.error('AI summary generation failed:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate AI summary';
    sendError(res, message, 500);
  }
};
//get feedback by id for admin
export const getFeedbackById = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) { sendError(res, 'Feedback not found', 404); return; }
    sendSuccess(res, feedback);
  } catch {
    sendError(res, 'Failed to retrieve feedback', 500);
  }
};
//update feedback status by admin
export const updateFeedbackStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!feedback) { sendError(res, 'Feedback not found', 404); return; }
    sendSuccess(res, feedback, `Status updated to "${req.body.status}"`);
  } catch {
    sendError(res, 'Failed to update status', 500);
  }
};
//reanalyze feedback with AI by admin
export const reanalyzeFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) { sendError(res, 'Feedback not found', 404); return; }
    sendSuccess(res, { message: 'AI re-analysis triggered' }, 'Re-analysis started');
    (async () => {
      try {
        const analysis = await analyzeFeedback(feedback.title, feedback.description);
        await Feedback.findByIdAndUpdate(feedback._id, { ai_category: analysis.category, ai_sentiment: analysis.sentiment, ai_priority: analysis.priority_score, ai_summary: analysis.summary, ai_tags: analysis.tags, ai_processed: true });
        console.log(`Re-analysis done: ${feedback._id}`);
      } catch (err) {
        console.error(`Re-analysis failed ${feedback._id}:`, err);
      }
    })();
  } catch {
    sendError(res, 'Failed to trigger re-analysis', 500);
  }
};
//delete feedback by admin
export const deleteFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) { sendError(res, 'Feedback not found', 404); return; }
    sendSuccess(res, { id: req.params.id }, 'Feedback deleted successfully');
  } catch {
    sendError(res, 'Failed to delete feedback', 500);
  }
};
