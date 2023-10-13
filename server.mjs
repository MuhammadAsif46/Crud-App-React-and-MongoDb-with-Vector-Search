import express from 'express';
// import cors from 'cors';
import path from 'path';

import authRouter from './routes/auth.mjs';
import postRouter from './routes/post.mjs';


const __dirname = path.resolve();

const app = express();
app.use(express.json()); // body parser
// app.use(cors());

app.use(express.static(path.join(__dirname, './web/build')))
// /api/v1/login
app.use("/api/v1", authRouter);

app.use((req, res, next) => { // bayriyar : yha sy agay na ja paye
    const token = "valid";
    if(token === "valid"){
        next();
    }else{
        res.status(401).send({message: "invalid token"});
    }
});

app.use("/api/v1", postRouter);



//     /static/vscode_windows.exe
// app.use("/static", express.static(path.join(__dirname, 'static')))


const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`Example server listening on port ${PORT}`)
})

