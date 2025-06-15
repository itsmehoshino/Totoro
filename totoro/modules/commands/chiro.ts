import axios from 'axios';

const meta: TotoroAI.CommandMeta = {
  name: 'chiro',
  role: 0,
  aliases: ['c'],
  cooldown: 5,
  developer: "Francis Loyd Raval",
  description: "An AI that acts like a flirty one.",
  usage: "chiro [ question ]"
};

const styler = {
  title: { 
    font: 'outline', 
    text: 'Chiro'
  },
  context: { 
    font: 'sans' 
  },
  footer: { 
    font: 'bold', 
    text: 'Totoro Bot v1.0' 
  },
  design: 'lines1',
};

async function execute({ response, args }){
  const prompt = args.join(" ");
  if (!prompt){
    return response.reply("Please provide a question.");
  }
  try {
    const res = await axios.get(`https://totoro-bb5e.onrender.com/chiro?query=${encodeURIComponent(prompt)}`)
    const data = res.data.response;
    response.reply(data);
  } catch (err) {
    response.reply(`ERR: ${err.message}`)
  }
}

export default { meta, execute, styler }
