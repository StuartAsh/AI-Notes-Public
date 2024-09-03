import axios from "axios";
import { useState } from "react";

type OpenAiPromptProps = {
  setShowPrompt: (showPrompt: boolean) => void;
  setToken: (token: string) => void;
};

export default function OpenAiPrompt({ setShowPrompt, setToken }: OpenAiPromptProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        const response = await axios.post("http://localhost:8020/login", { username, password });
        setToken(response.data.token);
      } else {
        await axios.post("http://localhost:8020/signup", { username, password, openaiKey: apiKey });
        const loginResponse = await axios.post("http://localhost:8020/login", { username, password });
        setToken(loginResponse.data.token);
      }
      setShowPrompt(false);
    } catch (error) {
      console.error("Authentication error:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <div className="openai-prompt">
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {!isLogin && (
        <input
          type="text"
          placeholder="OpenAI API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      )}
      <button onClick={handleSubmit}>{isLogin ? "Login" : "Sign Up"}</button>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Need to sign up?" : "Already have an account?"}
      </button>
    </div>
  );
}
