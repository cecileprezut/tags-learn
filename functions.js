// objet pour mapper les termes et leur id
let termList = {}
//id du terme sélectionné dans l'objet termList
let selectedTermId = 0
// tableau avec les termes et leur index par ordre d'apparition dans la description clinique
let wordIndexes = []

const clinicalDescription = document.getElementById("description").value;

let textToDisplay = "";
var termsIndex = []

function switchBetweenTextAreaAndTags() {
    console.log("Voici la liste au départ: ", selectedTerms);

    // On a activé la création de tags
    if (!isChecked) {
        // texte de la description clinique
        termsIndex = [...selectedTerms]

        function getWordIndex(text,word){
            return wordIndex = text.indexOf(word)
        }
        
        //prendre l'index des termes dans le texte, et créer un tableau avec termes/index par ordre d'apparition
        function getTermsIndexes(text, terms){
            wordIndexes = []
            console.log(wordIndexes)
            for(let i = 0; i < terms.length; i++) {
                let wordIndex = getWordIndex(text,terms[i])
                let endIndex = wordIndex + terms[i].length-1
                wordIndexes.push({startIndex: wordIndex, endIndex: endIndex, text:terms[i]})
            }
            wordIndexes =_.sortBy(wordIndexes, ['startIndex','text']);
        }

        getTermsIndexes(clinicalDescription, termsIndex)
        console.log(wordIndexes)

        //début de phrase + 'coucou'
        textToDisplay = clinicalDescription.slice(0, wordIndexes[0].startIndex) + `<span class="tagged" onclick="deleteTheTag('${wordIndexes[0].text}')" id="${wordIndexes[0].text + wordIndexes[0].startIndex}">${wordIndexes[0].text}</span> `
        
        for (let i = 0; i < wordIndexes.length -1 ; i++) {
            textToDisplay += clinicalDescription.slice(wordIndexes[i].startIndex + wordIndexes[i].text.length + 1, wordIndexes[i+1].startIndex) + `<span class="tagged" onclick="deleteTheTag('${wordIndexes[i+1].text}')" id="${wordIndexes[i+1].text + wordIndexes[i+1].startIndex}">${wordIndexes[i+1].text}</span> `
        }
        
        // fin de la phrase
        textToDisplay += clinicalDescription.slice(wordIndexes[2].startIndex + wordIndexes[2].text.length + 1, clinicalDescription.length)
        
        //Affichage du texte + tags
        document.getElementById("description").hidden = true;
        document.getElementById("textTags").hidden = false;
        document.getElementById("textTags").innerHTML = textToDisplay;
        isChecked = !isChecked;
        return termList
    }

    //Affichage du textarea
    document.getElementById("description").hidden = false;
    document.getElementById("textTags").hidden = true;
    isChecked = !isChecked;

    return wordIndexes
}

// Fonction qui permet de supprimer le tag de la liste de termes 
function deleteTheTag(selectedText) {
    debugger
    let selectedTermId = ''
    //récupérer l'id du terme sélectionné pour supprimer un tag
    const selectedTextString = selectedText.toString()
    for (let i = 0; i < wordIndexes.length; i++) {
        let selectedTermWithoutSpaces = selectedTextString.replace(/\s+/g, '-')
        if(selectedTextString.trim() == wordIndexes[i].text){
            selectedTermId = selectedTermWithoutSpaces + wordIndexes[i].startIndex
        }
    }
    //remplacer le span par le terme
    document.getElementById(selectedTermId).after(selectedText)
    document.getElementById(selectedTermId).remove()
    textToDisplay = document.getElementById('textTags').innerHTML
    selectedTerms.splice(selectedTerms.indexOf(selectedTermId), 1);

// cas de la désélection d'un multi-mots en cliquant sur un seul mot
// récupérer l'index de début et de fin du mot cliqué
let startIndex = clinicalDescription.indexOf(selectedText)
let endIndex = clinicalDescription.indexOf(selectedText) + selectedText.length-1
selectedTermIndexes = { startIndex: startIndex, endIndex: endIndex, text: selectedText}
// on compare les startIndex et les endIndex du mot cliqué et des mots taggés.
// Si le startIndex du mot cliqué est >= au startIndex du mot taggé et l'endIndex du mot cliqué est <= au startIndex du mot taggé, alors le mot cliqué est compris dans un mot taggé
// NE FONCTIONNE PAS POUR L'INSTANT
for(let i = 0; i < wordIndexes.length; i++) {
    if(wordIndexes[i].startIndex <= selectedTermIndexes.startIndex 
        && wordIndexes[i].endIndex >= selectedTermIndexes.endIndex){
            console.log('match')
        }
    }
}

// Fonction qui permet d'ajouter le tag à la liste de termes 
function addTheTag(expression) {
    if (!selectedTerms.includes(expression)) {
        let str = expression.trim()
        let strWithoutSpaces = str.replace(/\s+/g, '-')
        console.log(strWithoutSpaces)
        selectedTerms.push(str);
        const newStr = `<span class="tagged" onclick="deleteTheTag('${str}')" id="${strWithoutSpaces+clinicalDescription.indexOf(str)}">${str}</span>`
        textToDisplay = textToDisplay.replace(str, newStr)
        document.getElementById('textTags').innerHTML = textToDisplay
        wordIndexes.push({startIndex: clinicalDescription.indexOf(str), endIndex: clinicalDescription.indexOf(str)+str.length-1,text: str})
    }
}

//Permet de récupérer les mots selectionnés pour les ajouter comme un seul terme à la liste de termes.
function getSelectedText(termList) {
    //Recupere la selection en cours
    var selectedText = window.getSelection();
    
    //création d'un objet range.
    var range = document.createRange();
    range.setStart(selectedText.anchorNode, selectedText.anchorOffset);
    range.setEnd(selectedText.focusNode, selectedText.focusOffset);

    // Si la selection s'est faite de droite à gauche la range sera nulle et donc range.collapse sera à true. Utile pour la suite
    var backwards = range.collapsed;
    //On supprime la range pour liberer de la mémoire
    range.detach();

    //Permet d'ajuster le traitement de la selection si l'on a été de gauche à droite ou de droite à gauche
    var direction = [];
    if (backwards) {
        direction = ['backward', 'forward'];
    } else {
        direction = ['forward', 'backward'];
    }

    //On garde en mémoire où est la fin de la selection.
    var endNode = selectedText.focusNode;
    var endOffset = selectedText.focusOffset;
    //On deplace et on réduit la selection au début du premier mot de la selection.
    //si vo|us pata|te
    //vo|us patate
    selectedText.collapse(selectedText.anchorNode, selectedText.anchorOffset);

    if(selectedText.anchorOffset !== 0) {
        //|vous patate
        selectedText.modify("move", direction[1], "word");
    }
    //|vous pata|te
    selectedText.extend(endNode, endOffset);
    if(selectedText.focusOffset !== 0) {
        //|vous patate|
        selectedText.modify("extend", direction[0], "word");
    }
    if(selectedTerms.includes(selectedText.toString().trim())){
        return
    } else {
        addTheTag(selectedText.toString());
    }
    
    console.log("voici la liste après l'action ", selectedTerms);
}