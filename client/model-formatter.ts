/**
 * Normalizes technical/raw model strings into human-friendly short badges.
 * e.g.:
 *   "cpa-gpt/gemini-3.7-flash-high" -> "Gemini 3.7"
 *   "ollama-cloud/deepseek-v4.1-flash" -> "DeepSeek V4.1"
 *   "cline-pass/deepseek-v4.1-flash" -> "DeepSeek V4.1"
 *   "claude-opus-5-5" -> "Opus 5.5"
 *   "claude-3-7-sonnet-20250219" -> "Claude 3.7"
 *   "gpt-5.6-sol" -> "GPT-5.6"
 */
export function formatModelName(rawModel?: string | null): string | null {
  if (!rawModel) return null;
  const trimmed = rawModel.trim();
  if (trimmed.length === 0) return null;

  // Extract after provider slash if present (e.g. "cpa-gpt/gemini-3.7-flash-high" -> "gemini-3.7-flash-high")
  const slashIdx = trimmed.lastIndexOf("/");
  const modelPart = slashIdx !== -1 ? trimmed.slice(slashIdx + 1) : trimmed;
  const lower = modelPart.toLowerCase();

  // 1. Claude / Anthropic
  if (lower.includes("opus")) {
    const versionMatch = lower.match(/(\d+)[._-](\d+)/);
    return versionMatch ? `Opus ${versionMatch[1]}.${versionMatch[2]}` : "Claude Opus";
  }
  if (lower.includes("sonnet")) {
    const versionMatch = lower.match(/(\d+)[._-](\d+)/);
    return versionMatch ? `Sonnet ${versionMatch[1]}.${versionMatch[2]}` : "Claude Sonnet";
  }
  if (lower.includes("haiku")) {
    const versionMatch = lower.match(/(\d+)[._-](\d+)/);
    return versionMatch ? `Haiku ${versionMatch[1]}.${versionMatch[2]}` : "Claude Haiku";
  }
  if (lower.startsWith("claude")) {
    const versionMatch = lower.match(/(\d+)[._-](\d+)/);
    return versionMatch ? `Claude ${versionMatch[1]}.${versionMatch[2]}` : "Claude";
  }

  // 2. Gemini / Google
  if (lower.includes("gemini")) {
    const versionMatch = lower.match(/(\d+)[._-](\d+)/);
    const ver = versionMatch ? ` ${versionMatch[1]}.${versionMatch[2]}` : "";
    return lower.includes("flash") ? `Gemini${ver} Flash` : `Gemini${ver}`;
  }

  // 3. DeepSeek
  if (lower.includes("deepseek")) {
    const versionMatch = lower.match(/v?(\d+)[._-](\d+)/);
    return versionMatch ? `DeepSeek V${versionMatch[1]}.${versionMatch[2]}` : "DeepSeek";
  }

  // 4. OpenAI GPT
  if (lower.includes("gpt")) {
    const versionMatch = lower.match(/gpt[._-]?(\d+)[._-](\d+)/);
    if (versionMatch) return `GPT-${versionMatch[1]}.${versionMatch[2]}`;
    if (lower.includes("4o")) return "GPT-4o";
    if (lower.includes("4-turbo")) return "GPT-4 Turbo";
    if (lower.includes("o1")) return "o1";
    if (lower.includes("o3")) return "o3";
    return "GPT";
  }

  // 5. Qwen
  if (lower.includes("qwen")) {
    const versionMatch = lower.match(/(\d+)[._-](\d+)/);
    return versionMatch ? `Qwen ${versionMatch[1]}.${versionMatch[2]}` : "Qwen";
  }

  // 6. Llama / Mistral
  if (lower.includes("llama")) {
    const versionMatch = lower.match(/(\d+)/);
    return versionMatch ? `Llama ${versionMatch[1]}` : "Llama";
  }

  // Fallback: take up to first hyphen/token and uppercase cleanly
  const clean = modelPart.split(/[-_]/)[0];
  return clean.length <= 12 ? clean.toUpperCase() : clean.slice(0, 10);
}
