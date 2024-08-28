import axios, { AxiosResponse } from "axios";
import { useState } from "react";
import SimpleCrypto from "simple-crypto-js";

type OpenAiPromptProps = {
  setShowPrompt: (showPrompt: boolean) => void;
  setOpenAiKeyID: (openAiKeyID: string) => void;
};

export default function OpenAiPrompt({ setShowPrompt, setOpenAiKeyID }: OpenAiPromptProps) {
  const [apiKey, setApiKey] = useState("");
  const secret_key = import.meta.env.VITE_SECRET_KEY as string;

  function handleSubmit() {
    console.log("submitting key");
    const encryptedApiKey = new SimpleCrypto(secret_key).encrypt(apiKey);
    axios.post("http://127.0.0.1:8020/register", {
      apiKey: encryptedApiKey,
    }).then((response:AxiosResponse) => {
      setOpenAiKeyID(response.data.id);
      setShowPrompt(false);
    }).catch((error) => {
      console.log(error);
    });
  }
  return (
    <div className="openai-prompt">
      <h1>Enter your OpenAI API Key</h1>
      <p>To use this app you must enter your openAI API key.</p>
      <p>If you don't have an OpenAI account you can signup for an openAI developer account <a href="https://openai.com/product">here</a></p>
      <input type="text" size={48} placeholder="Enter your OpenAI API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
      <button onClick={handleSubmit}>Submit</button>
      <div className="note">Note: this app does not store or log your OpenAI API key. If you are worried create a temporary key and delete it after use. if using a public browser, make sure you close the tab when finished.</div>
    </div>
  );
}