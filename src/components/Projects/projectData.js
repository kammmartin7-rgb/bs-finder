// This file mirrors the project markdown documents and must be updated after every completed task.

export const projectData = {
  name: 'Business OS',
  statusKey: 'projectStatusActive',
  phaseKey: 'projectPhasePreRevenue',
  lastUpdated: '2026-07-10 22:35:41 IDT',
  completedModules: [
    'Business OS', 'BS Hunter', 'BS Funds shell', 'CRM', 'Tasks', 'Mission Control',
    'Demo Website Builder', 'Proposal Generator', 'Sales Center', 'WhatsApp', 'Languages', 'AI Center',
  ],
  incompleteModules: [
    'Real Lead Search', 'Real Website Builder', 'Deployment', 'Payments',
    'Global CRM', 'Automation', 'Client Success', 'AI Manager',
  ],
  knownIssues: [
    'projectIssuePaidSearch',
    'projectIssueDeployment',
    'projectIssueDemoQuality',
    'projectIssueSheets',
    'projectIssueLocalStorage',
    'projectIssueCors',
    'projectIssueMissionControl',
    'projectIssueTests',
    'projectIssueAiNotConfigured',
  ],
  revenueFlow: ['Lead', 'CRM', 'Demo Site', 'Sales Pitch', 'Proposal', 'WhatsApp', 'Payment', 'Real Website', 'Deployment', 'Customer Support'],
  documents: [
    { name: 'PROJECT_STATUS.md', descriptionKey: 'projectDocStatus' },
    { name: 'TASKS.md', descriptionKey: 'projectDocTasks' },
    { name: 'DECISIONS.md', descriptionKey: 'projectDocDecisions' },
    { name: 'DEVELOPMENT_GUIDE.md', descriptionKey: 'projectDocGuide' },
    { name: 'CHANGELOG.md', descriptionKey: 'projectDocChangelog' },
    { name: 'AGENTS.md', descriptionKey: 'projectDocAgents' },
  ],
}

export const projectModuleStatus = {
  'Business OS': 'completed', 'BS Hunter': 'completed', 'BS Funds shell': 'completed', CRM: 'completed', Tasks: 'completed',
  'Mission Control': 'completed', 'Demo Website Builder': 'completed', 'Proposal Generator': 'completed',
  'Sales Center': 'completed', WhatsApp: 'completed', Languages: 'completed', 'AI Center': 'completed',
  'Real Lead Search': 'incomplete', 'Real Website Builder': 'incomplete', Deployment: 'incomplete', Payments: 'incomplete',
  'Global CRM': 'incomplete', Automation: 'incomplete', 'Client Success': 'incomplete', 'AI Manager': 'incomplete',
}

export function getRelatedScreen(task = {}) {
  if (['BS Hunter', 'Lead Search', 'Demo Websites', 'Sales', 'Proposals', 'WhatsApp'].includes(task.category)) return 'bs-hunter'
  if (task.category === 'CRM') return 'crm'
  if (['Real Website Builder', 'Deployment'].includes(task.category)) return 'websites'
  return 'tasks'
}

const roadmapActions = {
  en: { 'Audit current workflow': 'Audit current workflow', 'Define success metrics': 'Define success metrics', 'Design production workflow': 'Design production workflow', 'Implement core capability': 'Implement core capability', 'Add validation and safeguards': 'Add validation and safeguards', 'Automate repetitive steps': 'Automate repetitive steps', 'Document and launch': 'Document and launch' },
  he: { 'Audit current workflow': 'בדיקת תהליך העבודה הנוכחי', 'Define success metrics': 'הגדרת מדדי הצלחה', 'Design production workflow': 'תכנון תהליך עבודה לייצור', 'Implement core capability': 'יישום היכולת המרכזית', 'Add validation and safeguards': 'הוספת בדיקות ואמצעי הגנה', 'Automate repetitive steps': 'אוטומציה של שלבים חוזרים', 'Document and launch': 'תיעוד והשקה' },
  ar: { 'Audit current workflow': 'مراجعة سير العمل الحالي', 'Define success metrics': 'تحديد مقاييس النجاح', 'Design production workflow': 'تصميم سير عمل الإنتاج', 'Implement core capability': 'تنفيذ القدرة الأساسية', 'Add validation and safeguards': 'إضافة التحقق وإجراءات الحماية', 'Automate repetitive steps': 'أتمتة الخطوات المتكررة', 'Document and launch': 'التوثيق والإطلاق' },
  ru: { 'Audit current workflow': 'Проверить текущий процесс', 'Define success metrics': 'Определить показатели успеха', 'Design production workflow': 'Спроектировать производственный процесс', 'Implement core capability': 'Реализовать основную возможность', 'Add validation and safeguards': 'Добавить проверки и защиту', 'Automate repetitive steps': 'Автоматизировать повторяющиеся шаги', 'Document and launch': 'Документировать и запустить' },
}

const starterTitles = {
  en: { 'Fix real lead search': 'Fix real lead search', 'Connect live lead data': 'Connect live lead data', 'Improve demo site quality': 'Improve demo site quality', 'Track proposal creation': 'Track proposal creation', 'Track WhatsApp sending': 'Track WhatsApp sending', 'Prepare payment integration for Sunday': 'Prepare payment integration for Sunday' },
  he: { 'Fix real lead search': 'תיקון חיפוש לידים אמיתי', 'Connect live lead data': 'חיבור נתוני לידים בזמן אמת', 'Improve demo site quality': 'שיפור איכות אתר הדמו', 'Track proposal creation': 'מעקב אחר יצירת הצעת מחיר', 'Track WhatsApp sending': 'מעקב אחר שליחת WhatsApp', 'Prepare payment integration for Sunday': 'הכנת חיבור התשלומים ליום ראשון' },
  ar: { 'Fix real lead search': 'إصلاح البحث عن العملاء الحقيقيين', 'Connect live lead data': 'ربط بيانات العملاء المباشرة', 'Improve demo site quality': 'تحسين جودة الموقع التجريبي', 'Track proposal creation': 'تتبع إنشاء عرض السعر', 'Track WhatsApp sending': 'تتبع إرسال WhatsApp', 'Prepare payment integration for Sunday': 'إعداد تكامل الدفع ليوم الأحد' },
  ru: { 'Fix real lead search': 'Исправить поиск реальных лидов', 'Connect live lead data': 'Подключить актуальные данные лидов', 'Improve demo site quality': 'Улучшить качество демо-сайта', 'Track proposal creation': 'Отслеживать создание предложения', 'Track WhatsApp sending': 'Отслеживать отправку WhatsApp', 'Prepare payment integration for Sunday': 'Подготовить интеграцию платежей к воскресенью' },
}

const descriptionTemplates = {
  en: { roadmap: (action, category) => `${action} for the ${category} workstream and record the measurable outcome.`, starter: (title) => `Complete the Business OS work item: ${title}.` },
  he: { roadmap: (action, category) => `${action} עבור תחום ${category} ותיעוד התוצאה המדידה.`, starter: (title) => `השלמת משימת Business OS: ${title}.` },
  ar: { roadmap: (action, category) => `${action} لمسار عمل ${category} وتسجيل النتيجة القابلة للقياس.`, starter: (title) => `إكمال مهمة Business OS: ${title}.` },
  ru: { roadmap: (action, category) => `${action} для направления «${category}» и зафиксировать измеримый результат.`, starter: (title) => `Выполнить задачу Business OS: ${title}.` },
}

const assigneeTranslations = {
  en: { 'BS Team': 'BS Team', 'Automation Agent': 'Automation Agent' },
  he: { 'BS Team': 'צוות BS', 'Automation Agent': 'סוכן אוטומציה' },
  ar: { 'BS Team': 'فريق BS', 'Automation Agent': 'وكيل الأتمتة' },
  ru: { 'BS Team': 'Команда BS', 'Automation Agent': 'Агент автоматизации' },
}

const legacyCategoryTranslations = {
  en: { Product: 'Product' },
  he: { Product: 'מוצר' },
  ar: { Product: 'المنتج' },
  ru: { Product: 'Продукт' },
}

export function localizeTaskContent(task, language, t) {
  const categoryKey = `category_${String(task.category || '').replaceAll(' ', '')}`
  const translatedCategory = task.category ? t(categoryKey) : ''
  const category = translatedCategory && translatedCategory !== categoryKey
    ? translatedCategory
    : legacyCategoryTranslations[language]?.[task.category] || task.category
  const starterTitle = starterTitles[language]?.[task.title]
  const separatorIndex = String(task.title || '').indexOf(': ')
  const originalAction = separatorIndex >= 0 ? task.title.slice(separatorIndex + 2) : ''
  const translatedAction = roadmapActions[language]?.[originalAction]
  const isKnownRoadmap = separatorIndex >= 0 && translatedAction && category
  const title = starterTitle || (isKnownRoadmap ? `${category}: ${translatedAction}` : task.title)

  let description = task.description
  if (starterTitle) description = descriptionTemplates[language].starter(starterTitle)
  else if (isKnownRoadmap) description = descriptionTemplates[language].roadmap(translatedAction, category)

  return {
    ...task,
    title,
    description,
    category: category || task.category,
    project: task.project,
    assignee: assigneeTranslations[language]?.[task.assignee] || task.assignee,
  }
}

export default projectData
