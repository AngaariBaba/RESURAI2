const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors'); // Import the cors middleware
const OpenAI = require('openai')
const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');

const pdf = require('pdf-parse');
const play = require('play-sound')(opts = {});

require('dotenv').config();

const client = new OpenAI({
    apiKey: process.OPENAI_API_KEY, // Replace with your actual key
});
const app = express();
const port = 3002;

let speech = 'Welcome to GeeksforGeeks';

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());

var main_data = "";

// Handle PDF file upload and perform PDF reading operation
app.post('/upload', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);

    // You can access the text content from 'data.text'
    console.log('PDF Content:', data.text);




    // Respond with the extracted text or any other information
    main_data = data.text; 
    const response =  await questions(main_data);

    console.log(JSON.parse(response));
    res.json(JSON.parse(response));
    
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.json({data:main_data});
  }
});


async function questions(pdf_content)
{
  const completion = await client.chat.completions.create({
    messages: [{ role: "system", content: `Extract the technical concepts like projects,programming languages and internship or industrial experience mentioned in this give text after the arrow -> "${pdf_content}" , Now generate 10 technical interview questions based on that extracted data. The response should be in this JSON format "{ questions : ['question 1','question 2','question 3'] }"` }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
}

// function handlePlay(speech)
// {
  
//   const gtts = new gTTS(speech, 'en');

//   gtts.save('Voice.mp3', function (err, result) {
//     if(err) {
//       throw new Error(err);
//     }

//     console.log('Text to speech converted!');
  
//     const filepath = path.join(__dirname, "Voice.mp3");
//   let player = play.play(filepath, function(err){
//     if (err)
//     {
//       console.log("error playing media");
//        throw err
//     }
//   }
//   )
// }
// );
  
// }



// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
