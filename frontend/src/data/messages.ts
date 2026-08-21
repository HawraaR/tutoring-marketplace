export type Conversation = {
  id: string;
  name: string;
  role: "Tutor" | "Peer";
  course: string;
  tone: "burgundy" | "olive" | "slate";
  updated: string;
  preview: string;
  unread: number;
  online: boolean;
  messages: { id: string; text: string; time: string; own?: boolean }[];
};

export const toneStyles = {
  burgundy: { avatar: "bg-burgundy", label: "text-burgundy" },
  olive: { avatar: "bg-olive", label: "text-olive" },
  slate: { avatar: "bg-slate-blue", label: "text-slate-blue" },
};

export const initialConversations: Conversation[] = [
  {
    id: "layla",
    name: "Layla Hassan",
    role: "Tutor",
    course: "MATH 201 · Calculus II",
    tone: "burgundy",
    updated: "10:42",
    preview: "I found a useful way to think about that integral.",
    unread: 2,
    online: true,
    messages: [
      { id: "layla-1", text: "Hi! How did the problem set go?", time: "10:35" },
      { id: "layla-2", text: "I am still working through the integration questions, especially Q3.", time: "10:38", own: true },
      { id: "layla-3", text: "I found a useful way to think about that integral.", time: "10:42" },
      { id: "layla-4", text: "That would be really helpful. I keep losing track of the substitution.", time: "10:44", own: true },
      { id: "layla-5", text: "Start by writing down u and du separately before changing the limits.", time: "10:46" },
      { id: "layla-6", text: "I had not been changing the limits, so that explains the strange answer.", time: "10:48", own: true },
      { id: "layla-7", text: "Exactly. The bounds should move with the substitution.", time: "10:49" },
      { id: "layla-8", text: "I will redo Q3 and try the same method on Q4.", time: "10:51", own: true },
      { id: "layla-9", text: "Q4 is a good one to practise with. Pay attention to the negative sign.", time: "10:53" },
      { id: "layla-10", text: "Noted. I will bring both solutions to our session.", time: "10:55", own: true },
      { id: "layla-11", text: "Great. We can review them together before moving on to applications.", time: "10:57" },
      { id: "layla-12", text: "Thanks, Layla. I feel much less stuck now.", time: "10:59", own: true },
      { id: "layla-13", text: "You are welcome. See you Thursday!", time: "11:00" },
    ],
  },
  {
    id: "omar",
    name: "Omar Reid",
    role: "Tutor",
    course: "CHEM 240 · Organic Chemistry",
    tone: "olive",
    updated: "Yesterday",
    preview: "The lab report outline looks good to me.",
    unread: 0,
    online: false,
    messages: [
      { id: "omar-1", text: "The lab report outline looks good to me.", time: "Yesterday" },
      { id: "omar-2", text: "Great, I will bring the revised version on Saturday.", time: "Yesterday", own: true },
    ],
  },
  {
    id: "sofia",
    name: "Sofia Alvarez",
    role: "Tutor",
    course: "SPAN 310 · Conversation",
    tone: "slate",
    updated: "Tue",
    preview: "Nos vemos el lunes para practicar.",
    unread: 0,
    online: true,
    messages: [{ id: "sofia-1", text: "Nos vemos el lunes para practicar.", time: "Tue" }],
  },
  {
    id: "study-group",
    name: "MATH 201 study group",
    role: "Peer",
    course: "4 members · Shared thread",
    tone: "slate",
    updated: "Mon",
    preview: "Maya shared a set of revision notes.",
    unread: 0,
    online: false,
    messages: [{ id: "group-1", text: "Maya shared a set of revision notes.", time: "Mon" }],
  },
  {
    id: "kenji",
    name: "Kenji Ito",
    role: "Tutor",
    course: "CS 220 · Data Structures",
    tone: "burgundy",
    updated: "Sun",
    preview: "The tree traversal examples are in the shared folder.",
    unread: 1,
    online: true,
    messages: [{ id: "kenji-1", text: "The tree traversal examples are in the shared folder.", time: "Sun" }],
  },
  {
    id: "maya",
    name: "Maya Chen",
    role: "Peer",
    course: "MATH 201 · Study partner",
    tone: "olive",
    updated: "Sat",
    preview: "Are you joining the library review tomorrow?",
    unread: 0,
    online: false,
    messages: [{ id: "maya-1", text: "Are you joining the library review tomorrow?", time: "Sat" }],
  },
  {
    id: "noah",
    name: "Noah Williams",
    role: "Peer",
    course: "CHEM 240 · Lab group",
    tone: "slate",
    updated: "Fri",
    preview: "I uploaded the spectroscopy notes for everyone.",
    unread: 0,
    online: false,
    messages: [{ id: "noah-1", text: "I uploaded the spectroscopy notes for everyone.", time: "Fri" }],
  },
  {
    id: "priya",
    name: "Priya Nair",
    role: "Tutor",
    course: "ECON 205 · Microeconomics",
    tone: "olive",
    updated: "Thu",
    preview: "We can cover elasticity in our next session.",
    unread: 0,
    online: true,
    messages: [{ id: "priya-1", text: "We can cover elasticity in our next session.", time: "Thu" }],
  },
];
