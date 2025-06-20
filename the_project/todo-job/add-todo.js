
const BACKEND_URL = process.env.BACKEND_URL;

const getRandomWikiUrl = async () => {
  const response = await fetch('https://en.wikipedia.org/wiki/Special:Random');
  return response.url;
}

const addTodo = async () => {
  const url = await getRandomWikiUrl();
  const todo = `Read ${url}`;
  try {
    await fetch(`${BACKEND_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ todo }),
    });
  } catch (error) {
    console.error('Error adding todo:', error);
  }
}

addTodo(); 