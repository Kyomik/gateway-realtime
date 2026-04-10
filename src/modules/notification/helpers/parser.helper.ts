export class NotificationParser {
  static parse(
    contents: any[], 
    context: Record<string, any>,
    studentName: string,
    metadata: any // Tambahkan data spesifik siswa di sini
  ): string {

    if (!contents || contents.length === 0) return '';

    const sortedContents = [...contents].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    let fullText = sortedContents.map((c) => c.content_value).join('');

    fullText = fullText.replace(/{{nama}}/g, studentName);

    const allData = { ...context, ...(metadata || {}) };

    Object.keys(allData).forEach((key) => {
      const placeholder = `{{${key}}}`;
      const value = allData[key] !== null && allData[key] !== undefined ? String(allData[key]) : '';
      fullText = fullText.split(placeholder).join(value);
    });

    return fullText.replace(/{{.*?}}/g, '').trim();
  }
}