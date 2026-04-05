const fs = require('fs');
const file = 'd:/FeedPulse/backend/src/controllers/feedback.controller.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStatsSearch = `const [total, openItems, priorityAgg, tagAgg] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: { $ne: 'Resolved' } }),`;

const targetStatsReplace = `const [total, newItems, inReview, resolved, priorityAgg, tagAgg] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'New' }),
      Feedback.countDocuments({ status: 'In Review' }),
      Feedback.countDocuments({ status: 'Resolved' }),`;

content = content.replace(targetStatsSearch, targetStatsReplace);

const targetResponseSearch = `sendSuccess(res, {
      total,
      openItems,`;

const targetResponseReplace = `sendSuccess(res, {
      total,
      new: newItems,
      inReview,
      resolved,`;

content = content.replace(targetResponseSearch, targetResponseReplace);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched backend feedback controller');
