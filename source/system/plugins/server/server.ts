import express from 'express';
import totoro from '../auto-totoro';
import educational from './category/api-educational';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from '../../views/custom';

const __dirname = fileURLToPath(import.meta.url);

const app = express();
app.use(express.static("public"));
app.use("", totoro);
app.use("", educational);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

export async function server(){
  app.listen(3000, () => {
    log("SYSTEM", "Totoro is now online and ready to use!");
  })
}