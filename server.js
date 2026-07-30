const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3001;

const publicPath = path.join(__dirname, "../public");
const adminPage = path.join(__dirname, "admin.html");

const ADMIN_PASSWORD = "banane123";


// Fichiers JSON
const maintenanceFile = path.join(__dirname, "maintenance.json");
const newsFile = path.join(__dirname, "news.json");



app.use(express.json({ limit: "1mb" }));


app.use(session({

    secret: "team-banane-secret",

    resave: false,

    saveUninitialized: false

}));



// Fichiers du site

app.use("/images", express.static(path.join(publicPath, "images")));

app.use("/style.css", express.static(path.join(publicPath, "style.css")));

app.use("/script.js", express.static(path.join(publicPath, "script.js")));




// Accueil

app.get("/", (req, res) => {


    const maintenance = JSON.parse(
        fs.readFileSync(maintenanceFile, "utf8")
    );


    if (maintenance.maintenance === true) {

        return res.sendFile(
            path.join(publicPath, "maintenance.html")
        );

    }


    res.sendFile(
        path.join(publicPath, "index.html")
    );


});




// Connexion admin

app.get("/login.html", (req,res)=>{

    res.sendFile(
        path.join(publicPath,"login.html")
    );

});




app.post("/admin/login",(req,res)=>{


    if(req.body.password === ADMIN_PASSWORD){


        req.session.admin = true;

        return res.send("OK");


    }


    res.status(401).send("Erreur");


});




// Déconnexion

app.get("/logout",(req,res)=>{


    req.session.destroy(()=>{

        res.redirect("/login.html");

    });


});




// Page admin

app.get("/admin.html",(req,res)=>{


    if(!req.session.admin){

        return res.redirect("/login.html");

    }


    res.sendFile(adminPage);


});





// -------------------------
// MAINTENANCE
// -------------------------


app.post("/admin/maintenance",(req,res)=>{


    if(!req.session.admin){

        return res.status(403).send("Accès refusé");

    }


    fs.writeFileSync(

        maintenanceFile,

        JSON.stringify({

            maintenance:req.body.maintenance

        },null,4)

    );


    res.send("OK");


});





// -------------------------
// STATUT SERVEUR
// -------------------------


app.get("/status",(req,res)=>{


    const maintenance = JSON.parse(

        fs.readFileSync(
            maintenanceFile,
            "utf8"
        )

    );



    if(maintenance.maintenance){


        res.json({

            text:"🟠 Maintenance en cours"

        });


    } else {


        res.json({

            text:"🟢 Serveur en ligne"

        });


    }


});





// -------------------------
// ACTUALITES
// -------------------------



// Lire les annonces

app.get("/news",(req,res)=>{


    const news = JSON.parse(

        fs.readFileSync(
            newsFile,
            "utf8"
        )

    );


    res.json(news);


});





// Publier une annonce

app.post("/admin/news",(req,res)=>{


    if(!req.session.admin){

        return res.status(403).send("Accès refusé");

    }



    const news = JSON.parse(

        fs.readFileSync(
            newsFile,
            "utf8"
        )

    );



    news.unshift({

        title:req.body.title,

        content:req.body.content,

        date:new Date().toLocaleDateString("fr-FR")


    });




    fs.writeFileSync(

        newsFile,

        JSON.stringify(
            news,
            null,
            4
        )

    );



    res.send("OK");


});





// Lancement

app.listen(PORT,()=>{


    console.log(
        `🍌 Serveur lancé sur http://localhost:${PORT}`
    );


});