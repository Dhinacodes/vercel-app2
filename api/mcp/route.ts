import pdf from 'pdf-parse';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tool, params } = body;
    
    if (tool === 'pdf_to_text' && params?.pdf) {
      const pdfBuffer = Buffer.from(params.pdf.data, 'base64');
      const data = await pdf(pdfBuffer);
      
      return new Response(JSON.stringify({
        type: 'tool_result',
        tool: 'pdf_to_text',
        content: {
          text: data.text.slice(0, 8000),
          pages: data.numpages,
          info: data.info
        }
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: 'PDF processing failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(request: Request) {
  return new Response(JSON.stringify({
    type: 'ready',
    tools: [{
      name: 'pdf_to_text',
      description: 'Extract text from uploaded PDF',
      inputSchema: {
        type: 'object',
        properties: {
          pdf: { type: 'file', format: 'pdf' }
        },
        required: ['pdf']
      }
    }]
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
