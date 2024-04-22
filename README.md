# AI Notes App

This app has two parts:

* A nodeJS API server found in server.cjs
* a react app.

## OpanAI configuration
This app uses the OpenAI API to proccess the AI prompts. To use this app you must have a valid OpenAI key.

Create an .env file in the apps root directory with the following line:
  OPENAI_API_KEY=""
  (copy and paste your OpenAI API key between the quotation marks)

## Starting up the APP:
Once you have added your OpenAI key to the .env file you are ready to run the app:

To run the app first start the nodeJS server by typing this command in your terminal:
   node server.cjs

Then start up the react app by typing this command in your terminal:
   npm run dev



 
