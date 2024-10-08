import axios from 'axios';
import { Comment } from '../contexts/CommentProvider';
import { getYoutubeComments } from './youtubeService';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const generateFakeUsername = async (realUsername: string): Promise<string> => {
  const prompt = `Generate a YouTube username similar in length, tone, and style to the following username: "${realUsername}". Make the username original but keep it convincing as if it belongs to a real person. In your response, say the username only. No quotes around the username, no special characters.`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that generates fake usernames based on provided context.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 10,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      },
    );

    const username = response.data.choices[0].message.content.trim();
    return username;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error generating fake username:', error.message);
    } else {
      console.error('Error generating fake username:', error);
    }
    return 'FakeUser123';
  }
};

const generateFakeCommentText = async (
  realComment: string,
  videoTitle: string,
): Promise<string> => {
  const basePrompt = `Based on the video titled "${videoTitle}" and the real comment: "${realComment}", write an original YouTube comment with these rules:
    - Not longer than the real comment
    - Half its length in characters. 2 sentences max
    - Has casual grammar and very minor typos
    - NO MISSING LETTERS IN WORDS
    - DO NOT USE COMMAS OR APOSTRAPHES
    - DO NOT USE PERIODS AT THE END OF COMMENTS
    - DO NOT USE 'um', 'uh', 'ugh', 'dat', 'gr8', 'luv', 'dhat', 'enuf', 'meen', 'vidz', or 'dis'
    - DO NOT START WITH 'Wow', 'Omg', 'Oh', 'Yeah', or 'Yo'
    - DO NOT REPLACE 'are' with 'r', 'why' with 'y', 'and' with 'n', 'th' with 'd' e.g. 'why are thats' to 'y r dats'
    - If negative or bored, keep it very short and limit to 1 sentence
    - If using slang, ensure it fits the context
    - Avoid hashtags
    - If you have more than one sentence and the last sentence is short, remove it
    - Follow these rules exactly, unless the persona you get says otherwise
    
    Here is your Persona: `;

  const personas = [
    "Confused child. Simple words, bad grammar, no caps, some typos, e.g., 'i dont get it why they evl'",
    "Child using slang. Emotional, bad grammar, e.g., 'Dat was lit frfr. stop cappin'",
    "Troll. Short, mocking, e.g., 'Ur video is bad'",
    "Angry. Frustrated, short, e.g., 'u stupid like why the hell idiot'",
    "Incoherent. Broken English, typos, e.g., 'Very good me like'",
    "Enthusiastic fan. Excited, use emojis, include timestamp, e.g., 'Ya 7:24 😂😂!! '",
    "Casual viewer. Polite, short, e.g., 'Good vid'",
    "Ranter. Off-topic rant, short, e.g., 'Honestly should be put in jail'",
    "Fan critic. Positive then critical, e.g., 'Love u but this aint it'",
    "Happy-go-lucky. Positive, e.g., 'Made my day!!'",
    "Trendy. Posts for likes, e.g., 'Like if you were born in the wrong generation' or 'Like if your watching this in 2024'",
    "Stolen Jokes. Generic stolen jokes, e.g., 'We gettin out the hood with this one 🔥🔥🔥'",
    "Long words. Multiple vowels together or letters at the end, 5 words max e.g., 'whaaaaaat was thatttttttt'",
    "Emojis. Just emojis, nothing else e.g., '💃💃💃💃💃💃'",
    "Shipper. Wants the youtuber to be in a relationship e.g., 'Dan should date Gio ngl'",
    "Request Kid. Asks for new video, no punctuation e.g., 'Pls do five nights at freddys next Foxy is my favorite'",
    `Quoter. Writes a quote from the video, then a short reaction e.g., '"Oh my god my hair is on fire" 😂🔥'`,
    "ALL CAPS. POINTS OUT SOMETHING AT A TIMESTAMP e.g., 'SKIBIDI MENTIONED 🗣🗣🗣🗣 8:14'",
    "Proud. Wants to mention their country and flag e.g., 'Lets go... love from france 🇫🇷🇫🇷❤❤'",
    "Laugher. ends comments in hahaha e.g., 'Love how the editor does sound effect hahahaha'",
    'Yapper. talks with good grammar, make the comment twice as long as the real comment',
  ];

  const selectedPersona = personas[Math.floor(Math.random() * personas.length)];
  const fullPrompt = `${basePrompt} ${selectedPersona}`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that generates original and creative fake YouTube comments based on provided context.',
          },
          { role: 'user', content: fullPrompt },
        ],
        max_tokens: 50,
        temperature: 0.9,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      },
    );

    let commentText = response.data.choices[0].message.content.trim();

    // 95% of the time, capitalize the first letter of the comment text string
    if (Math.random() < 0.95)
      commentText = commentText.charAt(0).toUpperCase() + commentText.slice(1);
    else
      commentText = commentText.charAt(0).toLowerCase() + commentText.slice(1);

    let typos = 0;
    const maxTypos = 3; // Artificial typos limit

    while (Math.random() < 0.6 && typos < maxTypos) {
      if (Math.random() < 0.15) {
        const randomIndex = Math.floor(Math.random() * commentText.length);
        commentText =
          commentText.slice(0, randomIndex) +
          commentText.slice(randomIndex + 1);
        typos++;
      }
    }

    while (Math.random() < 0.6 && typos < maxTypos) {
      if (Math.random() < 0.15) {
        const randomIndex = Math.floor(
          Math.random() * (commentText.length - 2),
        );
        const char1 = commentText[randomIndex];
        const char2 = commentText[randomIndex + 1];
        commentText =
          commentText.slice(0, randomIndex) +
          char2 +
          char1 +
          commentText.slice(randomIndex + 2);
        typos++;
      }
    }

    return commentText;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error generating fake comment:', error.message);
    } else {
      console.error('Error generating fake comment:', error);
    }
    return 'Wow, I never thought of it like that! Great video!';
  }
};

const generateFakeComment = async (realComment: Comment): Promise<Comment> => {
  const fakeUsername = await generateFakeUsername(realComment.username);
  const fakeCommentText = await generateFakeCommentText(
    realComment.comment,
    realComment.videoName || '',
  );

  return {
    profilePicture: realComment.profilePicture,
    username: fakeUsername,
    comment: fakeCommentText,
    likes: realComment.likes,
    date: realComment.date,
    isReal: false,
    videoName: realComment.videoName,
    video: realComment.video,
  };
};

export const getGeneratedComments = async (): Promise<Comment[]> => {
  const realComments = await getYoutubeComments();
  const generatedComments: Comment[] = [];

  for (const realComment of realComments) {
    const fakeComment = await generateFakeComment(realComment);
    generatedComments.push(fakeComment);

    if (generatedComments.length === 10) {
      break;
    }
  }

  return generatedComments;
};
