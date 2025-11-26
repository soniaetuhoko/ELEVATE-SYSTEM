import PDFDocument from 'pdfkit';

export const generateUserManualPDF = async (): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Title
      doc.fontSize(24).text('ELEVATE User Manual', { align: 'center' });
      doc.moveDown(2);

      // Login Section
      doc.fontSize(18).text('1. Getting Started');
      doc.fontSize(12).text('• Register with your ALU email (@alustudent.com or @alueducation.com)');
      doc.text('• Enter your name and create a password');
      doc.text('• Verify your email with the 6-digit OTP sent to your inbox');
      doc.text('• Login with your email and password');
      doc.moveDown();

      // Dashboard Section
      doc.fontSize(18).text('2. Dashboard Navigation');
      doc.fontSize(12).text('• View your progress statistics and platform overview');
      doc.text('• Access quick actions for missions, projects, and reflections');
      doc.text('• Monitor your learning streak and completion rates');
      doc.moveDown();

      // Missions Section
      doc.fontSize(18).text('3. Mission Management');
      doc.fontSize(12).text('• Create missions with title, description, and deadlines');
      doc.text('• Track progress from Planning to Completed status');
      doc.text('• Categorize missions: Technical, SoftSkills, or Business');
      doc.text('• Upload attachments and set milestones');
      doc.moveDown();

      // Projects Section
      doc.fontSize(18).text('4. Project Workspace');
      doc.fontSize(12).text('• Add projects under missions with detailed descriptions');
      doc.text('• Link repository URLs and live project demos');
      doc.text('• Tag technologies used and track development progress');
      doc.moveDown();

      // Reflections Section
      doc.fontSize(18).text('5. Reflective Journaling');
      doc.fontSize(12).text('• Write weekly reflections on your learning journey');
      doc.text('• Document key learnings, challenges, and improvements');
      doc.text('• Link reflections to specific missions or projects');
      doc.moveDown();

      // Collaboration Section
      doc.fontSize(18).text('6. Collaboration & Mentorship');
      doc.fontSize(12).text('• Join peer circles based on your interests');
      doc.text('• Connect with mentors for guidance and feedback');
      doc.text('• Share progress and collaborate with fellow students');

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const getHelpContent = () => ({
  sections: [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: 'Learn how to register, verify your email, and login to ELEVATE.',
      steps: [
        'Register with your ALU email address',
        'Check your email for the 6-digit OTP',
        'Complete verification and create your account',
        'Login with your credentials'
      ]
    },
    {
      id: 'missions',
      title: 'Managing Missions',
      content: 'Create and track your learning missions effectively.',
      steps: [
        'Click "Create Mission" from the dashboard',
        'Fill in title, description, and deadline',
        'Choose a category (Technical, SoftSkills, Business)',
        'Track progress and update status as you advance'
      ]
    },
    {
      id: 'projects',
      title: 'Project Workspace',
      content: 'Build and showcase your projects within missions.',
      steps: [
        'Navigate to a mission and click "Add Project"',
        'Provide project details and timeline',
        'Add repository and live demo URLs',
        'Tag technologies and upload attachments'
      ]
    },
    {
      id: 'reflections',
      title: 'Writing Reflections',
      content: 'Document your learning journey through reflective writing.',
      steps: [
        'Go to Reflections page and click "New Reflection"',
        'Write about your weekly learnings and challenges',
        'Link to relevant missions or projects',
        'Save and review your growth over time'
      ]
    }
  ]
});