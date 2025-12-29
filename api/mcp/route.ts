import pdf from 'pdf-parse';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tool, params } = body;
    
    if (tool === 'pdf_to_text' && params?.pdf) {
      const pdfBuffer = Buffer.from(params.pdf.data, 'base64');
      const data = await pdf(pdfBuffer);
      
      return Response.json({
        type: 'tool_result',
        tool: 'pdf_to_text',
        content: {
          text: data.text.slice(0, 8000),
          pages: data.numpages
        }
      });
    }
  } catch (e) {
    return Response.json({ error: 'PDF processing failed' }, { status: 400 });
  }
}

export async function GET() {
  return Response.json({
    type: 'ready',
    tools: [{
      name: 'pdf_to_text',
      description: 'Extract text from uploaded PDF',
      inputSchema: {
        type: 'object',
        properties: { pdf: { type: 'file', format: 'pdf' } },
        required: ['pdf']
      }
    }]
  });
}
