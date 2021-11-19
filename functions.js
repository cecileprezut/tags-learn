// objet pour mapper les termes et leur id
let termList = {};
//id du terme sélectionné dans l'objet termList
let selectedTermId = 0;
// tableau avec les termes et leur index par ordre d'apparition dans la description clinique {startIndex: wordIndex, endIndex: endIndex, text: terms[i]}
let wordIndexes = [];

const clinicalDescription = document.getElementById("description").value;

let textToDisplay = "";
var termsIndex = [];

function getWordIndex(text, word) {
  return (wordIndex = text.indexOf(word));
}

function switchBetweenTextAreaAndTags() {
  console.log("Voici la liste au départ: ", selectedTerms);

  // On a activé la création de tags
  if (!isChecked) {
    // texte de la description clinique
    termsIndex = [...selectedTerms];

    //prendre l'index des termes dans le texte, et créer un tableau avec termes/index par ordre d'apparition
    function getTermsIndexes(text, terms) {
      wordIndexes = [];
      for (let i = 0; i < terms.length; i++) {
        let wordIndex = getWordIndex(text, terms[i]);
        let endIndex = wordIndex + terms[i].length - 1;
        wordIndexes.push({
            startIndex: wordIndex,
            endIndex: endIndex,
            text: terms[i],
        });
      }
      wordIndexes = _.sortBy(wordIndexes, ["startIndex", "text"]);
    }

    getTermsIndexes(clinicalDescription, termsIndex);

    //début de phrase + 'coucou'
    textToDisplay =
      clinicalDescription.slice(0, wordIndexes[0].startIndex) +
      `<span class="tagged" onclick="deleteTheTag('${
        wordIndexes[0].text
      }')" id="${wordIndexes[0].text + wordIndexes[0].startIndex}">${
        wordIndexes[0].text
      }</span> `;

    for (let i = 0; i < wordIndexes.length - 1; i++) {
      textToDisplay +=
        clinicalDescription.slice(
          wordIndexes[i].startIndex + wordIndexes[i].text.length + 1,
          wordIndexes[i + 1].startIndex
        ) +
        `<span class="tagged" onclick="deleteTheTag('${
          wordIndexes[i + 1].text
        }')" id="${wordIndexes[i + 1].text + wordIndexes[i + 1].startIndex}">${
          wordIndexes[i + 1].text
        }</span> `;
    }

    // fin de la phrase
    textToDisplay += clinicalDescription.slice(
      wordIndexes[2].startIndex + wordIndexes[2].text.length + 1,
      clinicalDescription.length
    );

    //Affichage du texte + tags
    document.getElementById("description").hidden = true;
    document.getElementById("textTags").hidden = false;
    document.getElementById("textTags").innerHTML = textToDisplay;
    isChecked = !isChecked;
    return termList;
  }

  //Affichage du textarea
  document.getElementById("description").hidden = false;
  document.getElementById("textTags").hidden = true;
  isChecked = !isChecked;

  return wordIndexes;
}

// Fonction qui permet de supprimer le tag de la liste de termes
function deleteTheTag(selectedText) {
  // classe les termes dans le tableau wordIndexes selon leur ordre d'apparition dans le texte
  wordIndexes = _.sortBy(wordIndexes, ["startIndex", "text"]);

  //le mot est déjà taggé à un autre endroit du texte
  const selectedTextIndex = wordIndexes.findIndex((obj) => {
    return obj.text == selectedText;
  });

  // si on sélectionne un mot qui est déjà taggé ailleurs dans le texte, on ne fait rien
  // trouver les occurrences du mot cliqué dans le texte
  let index = 0;
  let termOccurrencesIndexes = [];
  let startIndex = 0;
  while ((index = clinicalDescription.indexOf(selectedText, startIndex)) > -1) {
    termOccurrencesIndexes.push(index);
    startIndex = index + selectedText.length;
  }
  console.log();
  // si le terme cliqué n'est pas taggé, on ne fait rien

  // si le terme est taggé, il a un id
  const selectedTextStringForDeletion = selectedText.toString();
  for (let i = 0; i < wordIndexes.length; i++) {
    let selectedTermWithoutSpaces = selectedTextStringForDeletion
      .trim()
      .replace(/\s+/g, "-");

    if (selectedTextStringForDeletion.trim() == wordIndexes[i].text) {
      selectedTermId = selectedTermWithoutSpaces + wordIndexes[i].startIndex;
    }
  }

  console.log(selectedTermId);

  if (!document.getElementById(selectedTermId)) {
    return;
  }

  //remplacer le span par le terme
  document.getElementById(selectedTermId).after(selectedText);
  document.getElementById(selectedTermId).remove();
  textToDisplay = document.getElementById("textTags").innerHTML;
  selectedTerms.splice(selectedTerms.indexOf(selectedTermId), 1);
  wordIndexes.splice(selectedTextIndex, 1);
  return selectedTerms;
}

// Fonction qui permet d'ajouter le tag à la liste de termes
function addTheTag(expression) {
  if (!selectedTerms.includes(expression)) {
    let str = expression.trim();
    selectedTerms.push(str);
    // utile pour la création de l'id de l'expression taggée
    let strWithoutSpaces = str.replace(/\s+/g, "-");

    const newStr = `<span class="tagged" onclick="deleteTheTag('${str}')" id="${
      strWithoutSpaces + clinicalDescription.indexOf(str)
    }">${str}</span>`;
    textToDisplay = textToDisplay.replace(str, newStr);
    document.getElementById("textTags").innerHTML = textToDisplay;
    wordIndexes.push({
      startIndex: clinicalDescription.indexOf(str),
      endIndex: clinicalDescription.indexOf(str) + str.length - 1,
      text: str,
    });
  } else {
    const index = selectedTerms.indexOf(expression);
    selectedTerms.splice(index, 1);
  }
  console.log(selectedTerms);
}

//Permet de récupérer les mots selectionnés pour les ajouter comme un seul terme à la liste de termes.
function getSelectedText() {
  //Recupere la selection en cours
  var selectedText = window.getSelection();

  //création d'un objet range.
  var range = document.createRange();
  range.setStart(selectedText.anchorNode, selectedText.anchorOffset);
  range.setEnd(selectedText.focusNode, selectedText.focusOffset);

  // Si la selection s'est faite de droite à gauche la range sera null et donc range.collapse sera à true. Utile pour la suite
  var backwards = range.collapsed;
  //On supprime la range pour liberer de la mémoire
  range.detach();

  //Permet d'ajuster le traitement de la selection si l'on a été de gauche à droite ou de droite à gauche
  var direction = [];
  if (backwards) {
    direction = ["backward", "forward"];
  } else {
    direction = ["forward", "backward"];
  }

  //On garde en mémoire où est la fin de la selection.
  var endNode = selectedText.focusNode;
  var endOffset = selectedText.focusOffset;
  //On deplace et on réduit la selection au début du premier mot de la selection.
  //si vo|us pata|te
  //vo|us patate
  selectedText.collapse(selectedText.anchorNode, selectedText.anchorOffset);

  if (selectedText.anchorOffset !== 0) {
    //|vous patate
    selectedText.modify("move", direction[1], "word");
  }
  //|vous pata|te
  selectedText.extend(endNode, endOffset);
  if (selectedText.focusOffset !== 0) {
    //|vous patate|
    selectedText.modify("extend", direction[0], "word");
  }

  // cas de la désélection d'un multi-mots en cliquant sur un seul mot
  // récupérer l'index de début et de fin du mot cliqué
  let startIndex = clinicalDescription.indexOf(selectedText);
  let endIndex =
    clinicalDescription.indexOf(selectedText) +
    selectedText.toString().length - 2;
  
    const selectedTermIndexes = {
        startIndex: startIndex,
        endIndex: endIndex,
        text: selectedText,
    };

  // on détagge un terme uniquement s'il est déjà taggé et qu'il a donc un id
  let selectedTermId = "";
  //récupérer l'id du terme sélectionné pour supprimer un tag
  const selectedTextString = selectedText.toString();
  for (let i = 0; i < wordIndexes.length; i++) {
    let selectedTermWithoutSpaces = selectedTextString
      .trim()
      .replace(/\s+/g, "-");

    if (selectedTextString.trim() === wordIndexes[i].text) {
        debugger
      selectedTermId = selectedTermWithoutSpaces + wordIndexes[i].startIndex;
    }
  }

  // si on sélectionne un seul mot à supprimer
  if (document.getElementById(selectedTermId)) {
    for (let i = 0; i < wordIndexes.length; i++) {
      let selectedTermWithoutSpaces = selectedTextString.replace(/\s+/g, "-");

      if (selectedTextString.trim() == wordIndexes[i].text) {
          debugger
        selectedTermId = selectedTermWithoutSpaces + wordIndexes[i].startIndex;
      }
    }

    // on compare les startIndex et les endIndex du mot cliqué et des mots taggés.
    // Si le startIndex du mot cliqué est >= au startIndex du mot taggé
    // et si l'endIndex du mot cliqué est <= au startIndex du mot taggé,
    // alors le mot cliqué est compris dans un mot taggé
    for (let i = 0; i < wordIndexes.length; i++) {
      if (
        selectedTermIndexes.startIndex >= wordIndexes[i].startIndex &&
        selectedTermIndexes.endIndex <= wordIndexes[i].endIndex
      ) {
          debugger
        selectedTerms = deleteTheTag(wordIndexes[i].text);
        return selectedTerms;
      }
    }
  }

  // si on sélectionne un terme d'une expression multi-mots pour supprimer le tag
  // on compare les startIndex et les endIndex du mot cliqué et des mots taggés.
  // Si le startIndex du mot cliqué est >= au startIndex du mot taggé
  // et si l'endIndex du mot cliqué est <= au startIndex du mot taggé,
  // alors le mot cliqué est compris dans un mot taggé
  for (let i = 0; i < wordIndexes.length; i++) {
    if (
      selectedTermIndexes.startIndex >= wordIndexes[i].startIndex &&
      selectedTermIndexes.endIndex <= wordIndexes[i].endIndex
    ) {
        debugger
      selectedTerms = deleteTheTag(wordIndexes[i].text);
      return selectedTerms;
    }
  }

  addTheTag(selectedText.toString());

  console.log("voici la liste après l'action ", selectedTerms);
}
