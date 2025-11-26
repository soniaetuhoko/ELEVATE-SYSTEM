import puppeteer from 'puppeteer';
import * as createCsvWriter from 'csv-writer';
import { prisma } from '../db/prisma';

export const exportUserDataToPDF = async (userId: string) => {
  try {
    const [user, missions, projects, reflections] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.mission.findMany({ where: { userId } }),
      prisma.project.findMany({ where: { userId } }),
      prisma.reflection.findMany({ where: { userId } })
    ]);

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .item { margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ELEVATE Learning Report</h1>
          <h2>${user?.name}</h2>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <h3>Missions (${missions.length})</h3>
          ${missions.map((m) => `
            <div class="item">
              <strong>${m.title}</strong> - ${m.status} (${m.progress}%)
              <br><small>${m.description}</small>
            </div>
          `).join('')}
        </div>
        
        <div class="section">
          <h3>Projects (${projects.length})</h3>
          ${projects.map((p) => `
            <div class="item">
              <strong>${p.title}</strong> - ${p.status}
              <br><small>${p.description}</small>
            </div>
          `).join('')}
        </div>
        
        <div class="section">
          <h3>Reflections (${reflections.length})</h3>
          ${reflections.map((r) => `
            <div class="item">
              <strong>${r.title}</strong>
              <br><small>${r.content.substring(0, 100)}...</small>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

    return pdf;
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('PDF generation not available in this environment');
  }
};

export const exportUserDataToCSV = async (userId: string) => {
  const missions = await prisma.mission.findMany({ where: { userId } });
  
  const csvWriter = (createCsvWriter as any).createObjectCsvStringifier({
    header: [
      { id: 'title', title: 'Title' },
      { id: 'status', title: 'Status' },
      { id: 'progress', title: 'Progress' },
      { id: 'category', title: 'Category' },
      { id: 'deadline', title: 'Deadline' }
    ]
  });

  const records = missions.map((m) => ({
    title: m.title,
    status: m.status,
    progress: `${m.progress}%`,
    category: m.category,
    deadline: m.deadline.toISOString().split('T')[0]
  }));

  return csvWriter.getHeaderString() + csvWriter.stringifyRecords(records);
};