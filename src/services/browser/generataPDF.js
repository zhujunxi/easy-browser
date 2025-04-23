// /**
//  * Generate PDF document and Tool definitions
//  */
// import LlmService from '@services/llm/index.js';
// import { jsPDF } from "jspdf";

// const generataPDF = {
//     call: async ({ prompt }) => {
//         try {
//             const messages = [
//                 { role: "system", content: "You are an assistant who is good at writing research reports." },
//                 { role: "user", content: prompt }
//             ]
//             // const result = await LlmService.fetch(messages);

//             // console.log(result);
//             const doc = new jsPDF();

//             doc.text('result.data . Today is happy day', 10, 10);
//             doc.save("a4.pdf");

//             return `Document generation successful.`;
//         } catch (error) {
//             return error.message;
//         }
//     },
//     tool: {
//         "type": "function",
//         "function": {
//             "name": "generataPDF",
//             "description": "Generate PDF document",
//             "parameters": {
//                 "type": "object",
//                 "properties": {
//                     "prompt": {
//                         "type": "string",
//                         "description": "Prompt words for generating document"
//                     }
//                 },
//                 "required": ["tagIndex"]
//             }
//         }
//     }
// }

// export default generataPDF;
