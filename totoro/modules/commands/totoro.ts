import axios from 'axios';

const meta = {
  name: 'totoro',
  aliases: ['t'],
};
async function execute({ response, args }){
  const prompt = args.join(" ");
  if (!prompt){
    return response.reply("Please provide a question.");
  }
  try {
    const res = await axios.get(`https://totoro-bb5e.onrender.com/totoro?query=${encodeURIComponent(prompt)}`)
    const data = res.data.response;
    response.reply(data);
  } catch (err) {
    response.reply(`ERR: ${err.message}`)
  }
}

export default { meta, execute }
