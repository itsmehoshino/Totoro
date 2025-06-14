import express from 'express';
import totoro from '../auto-totoro';
import custom from './category/api-custom';
import character from './category/api-character';
import educational from './category/api-educational';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from '../../views/custom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, './views')));
app.use('', totoro);
app.use('', custom);
app.use('', character);
app.use('', educational);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './views', 'index.html'));
});

export async function server() {
  app.listen(3000, () => {
    log('SYSTEM', 'Totoro is now online and ready to use!');
  });
}
