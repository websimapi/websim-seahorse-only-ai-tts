/* ...existing code... */
import { nanoid } from "nanoid";

const form = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chat = document.getElementById("chat");
const status = document.getElementById("status");
const emojiInput = document.getElementById("emojiInput");
const askSeahorseBtn = document.getElementById("askSeahorseBtn");

let conversationHistory = [];

// helper to append message
function appendMessage(text, cls = "ai") {
  const el = document.createElement("div");
  el.className = `message ${cls}`;
  el.textContent = text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

// play audio from url
async function playUrl(url) {
  const a = new Audio(url);
  await a.play();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userText = userInput.value.trim();
  if (!userText) return;
  userInput.value = "";

  appendMessage(userText, "user");
  status.textContent = "Thinking...";

  // maintain a short history
  conversationHistory.push({ role: "user", content: userText });
  conversationHistory = conversationHistory.slice(-8);

  // system instruction: respond using only the selected emoji character(s)
  const seahorseEmoji = (emojiInput.value || "🐴").trim() || "🐴";
  const systemMsg = {
    role: "system",
    content: `You are an assistant that must respond using ONLY this character sequence and nothing else: "${seahorseEmoji}". Use that sequence repeatedly or in groups to express the reply. No other letters, punctuation, or whitespace. Keep the response concise.`
  };

  // prepare messages sent to model
  const messages = [systemMsg, ...conversationHistory];

  try {
    // call websim chat completion
    const completion = await websim.chat.completions.create({
      messages,
      // keep response short
      max_tokens: 64,
    });

    const aiText = completion.content.trim();

    // show AI text (should be emoji-only)
    appendMessage(aiText, "ai");
    status.textContent = "Generating speech...";

    // generate TTS (websim.textToSpeech)
    const tts = await websim.textToSpeech({
      text: aiText,
      voice: "en-male"
    });

    // play result
    await playUrl(tts.url);
    status.textContent = "Played.";
    // store assistant message in history
    conversationHistory.push({ role: "assistant", content: aiText });
  } catch (err) {
    console.error(err);
    status.textContent = "Error: " + (err.message || err);
    appendMessage("Error: failed to get response", "ai");
  }
});

askSeahorseBtn.addEventListener("click", async () => {
  // programmatically ask the AI "What is the seahorse emoji" using the current emoji input
  const question = "What is the seahorse emoji";
  userInput.value = question;
  // trigger the form submit handler
  form.requestSubmit();
});
/* ...existing code... */