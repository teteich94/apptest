const express = require('express')
const app = express();
const port = 3000;
const host = 'localhost';
const levenshtein = require('js-levenshtein') ;   
const cles = ["gibbs4567"
			 ,"gibbs4659"
			 ,"gibbs5666"
			 ,"gibbs5632"
			 ,"gibbs0563"
			 ,"gibbs5699"
			 ,"gibbs7412"
			 ,"gibbs8521"
			 ,"gibbs9632"
			 ,"gibbs2361"];


var maxChaine = 50;
var clesActivite = [];

//appel la fonction resetActivite toute les 1 minute.
//empeche l'utilisateur de lancer plus de 5 requete par minute
var intervalId = setInterval(resetActivite, 60000);
//appel la fonction requeteUtilisateur toute les 30 secondes.
//met à jour le compteur des requetes des utilisateurs.
var cptRequete = 0;

setInterval(() => {
  cptRequete = requeteUtilisateur();
}, 3000);

//pointe vers le répertoire "views"
app.set('views', './views');
//affecte le moteur de modèle à utilise
app.set('view engine', 'pug');

//page d'accueil
app.get('/', (req, res) => {	
	//var cptRequete = requeteUtilisateur();
	//rend le modèle.
	res.render('index', { 
	clesActivite,
	cptRequete
	});
	
});

//page du service adn
app.get('/service', (req, res) => {
	//rend le modèle.
	res.render('service');
});

app.get('/:id/distance/:nameA/:nameB', (req, res) => {
	let id = req.params.id;
	let currentdate = new Date(); 
	let formatter = new Intl.DateTimeFormat('fr', { month: 'short' });
	let datetime =  currentdate.getDate() + " "
					+ formatter.format(currentdate)  + " " 
					+ currentdate.getFullYear() + " "  
					+ currentdate.getHours() + "h"  
					+ currentdate.getMinutes() + ":";					
	
	let nameA = req.params.nameA;
	let nameB = req.params.nameB;
	let lenthA = nameA.length;
	let lenthB = nameB.length;
	let regex = /\d/g;
						
	//erreur si, la cle n'existe pas.
	if (!cles.includes(id)){		
		res.end(`vous n’avez pas les autorisations pour utiliser ce service`);	
	
	//erreur si, la longeur d'une des chaine d'adn est superieur à 50.
	}else if (lenthA > 50 || lenthB > 50) {		
		res.end(`une des deux chaînes est trop longue (gardez des chaînes inférieures à 50)`);
		
	//erreur si, une des chaine d'adn contient des nombres.
	}else if (regex.test(nameA) || regex.test(nameB)) {		
		res.end(`une des chaînes ne code pas de l’ADN`);
		
	//si pas d'erreur, on affiche.
	}else if (cles.includes(id)){
		
			//si le nombre de requete par minute de l'utilisateur est infereieur à 5.
			if(!activiteBoolId(id) || activiteGet(id) < 5){
				//on ajoute la cle dans notre tab d'activite pour eviter de surcharger le service.
				activiteAjout(id);
				console.table(clesActivite);
								
				//calcul du temps d'execution du levenshtein pour trouver la distance entre A et B.						
				let start = new Date().getTime();
				let distance = levenshtein (nameA ,nameB );
				let end = new Date().getTime();
				let time = end - start;				
								
				res.json({ utilisateur: id, date: datetime , A:nameA, B:nameB, distance: distance
				,"temps de calcul (ms)": time, "interrogations minute:": activiteGet(id)});
			}else{
				res.json({ utilisateur: id, erreur : "nombre de requêtes dépassé, attendez une minute" });				
				console.table(clesActivite);
			}
				
	//si erreur non répertorié.
	}else{
		res.end(`la requête est mal formée`);
	
	}
		
});


//http://localhost:3000/gibbs4659/distance/ACGTGCAGTACGATGCGTAGC/ACGTGCTGTATGATGCGTAG


//garder une trace des chemin dans les logs
app.use('/', (req, res, next) => {
	console.log(`URL: ${req.url}`);
	next();
});

//si mauvais chemin
app.get('*', (req, res, next) => {
	res.status(200).send('Sorry, page not found');
	next();
});

app.listen(port, host, () => {
	console.log(`Server started at ${host} port ${port}`);
});

function requeteUtilisateur(){
let res = 0;

//on parcourt notre array d'activite
	for (let i = 0; i < clesActivite.length; i++) {			
		// on incremente de 1 le nombre de requete de l'utlisateur(Id)
		res = clesActivite[i][1] + res;		
	}	
return(res);
}

//fonction qui reinitialise l'array d'activite.
function resetActivite(){
	clesActivite = [];
}

//Fonction, permettant d'ajouter/d'incrementer le nombre de requete par utilisateur.
function activiteAjout(id){		
	//si utilisateur present dans l'activite, on incremente de 1 son nombre de requete.
	if(activiteBoolId(id)){				
		//on parcourt notre array d'activite
		for (let i = 0; i < clesActivite.length; i++) {			
			// on incremente de 1 le nombre de requete de l'utlisateur(Id)
			if(clesActivite[i][0] == id){	
				clesActivite[i][1] += 1				
			}
		}				
	}else{
		//si array d'activite vide, on ajoute l'utisateur et son nombre d'activite à 1.
		clesActivite.push([id,1]);	
	}	
}

//Fonction booleene, retourne true/false si l'utilisateur à deja executé une requete.
function activiteBoolId(id){	
let bool = false;

	//on parcourt notre array d'activite.
	for (let i = 0; i < clesActivite.length; i++) {		
	
		//si element present dans notre array d'activite, on recupère son indice.
		if(clesActivite[i][0] == id){
			bool = true;			
		}
	}
	
return bool;
}


//Fonction, permettant d'obtenir le nombre de requete executer d'un utilisateur.
function activiteGet(id){	

	//on parcourt notre array d'activite.
	for (let i = 0; i < clesActivite.length; i++) {		
	
		//si element present dans notre array d'activite, on recupère son indice.
		if(clesActivite[i][0] == id){				
			return(clesActivite[i][1]);			
		}
	}
}


/*
function chgAction(action_name)
{
    if(action_name=="formAdn" ) {
        document.search-theme-form.action = "/AAA";
    }
    
}

*/