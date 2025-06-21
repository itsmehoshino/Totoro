import axios from 'axios';

const meta: TotoroAI.CommandMeta = {
  name: 'yumi',
  role: 0,
  aliases: ['y'],
  developer: "Francis Loyd Raval",
  description: "A yandere AI developed by Francis Loyd Raval.",
  usage: "yumi [ question ]"
};

const styler = {
  title: {
    font: 'outline',
    text: 'YUMI'
  },
  context: {
    font: 'sans'
  },
  footer: {
    font: 'bold',
    text: ''
  },
  isFooter: false,
  design: 'lines6',
  icon: '👱‍♀️'
};

async function execute({ response, args }){
  const prompt = args.join(" ");
  if (!prompt){
    return response.reply("Please provide a question.");
  }
  try {
    const res = await axios.get(`https://totoro-bb5e.onrender.com/yumi?query=${encodeURIComponent(prompt)}`)
    const data = res.data.response;
    response.reply(data);
  } catch (err) {
    response.reply(`ERR: ${err.message}`)
  }
}

export default { meta, execute, styler }
