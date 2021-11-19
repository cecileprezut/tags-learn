import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  text: string = '';
  private textAsArray: string[] = [];
  editTagMode = false;
  selectedTerms: string[] = ['Coucou', 'patate'];
  spanArray: HTMLElement[] = [];

  @ViewChild('editTag') editTagElementRef: ElementRef | null = null;

  constructor(private renderer: Renderer2) {
    this.text =
      'Coucou comment allez vous patate patate ? La sciatique de la sciatique...';
    this.textAsArray = this.text.split(' ');
  }

  ngAfterViewInit(): void {
    this.renderer.listen(
      this.editTagElementRef?.nativeElement,
      'mouseup',
      (event) => {
        //  const e = event as MouseEvent

        const selection = window.getSelection();

        const anchorNode = selection?.anchorNode as Node;
        const focusNode = selection?.focusNode as Node;
        const anchorOffset = selection?.anchorOffset as number;

        console.log(selection?.anchorNode);
        var range = new Range()
        if (selection) {
          range.setStart(anchorNode, selection.anchorOffset);
          range.setEnd(focusNode, selection.focusOffset);

          selection.collapse(anchorNode, anchorOffset);

          const backwards = range.collapsed;
          let direction = [];
          if (backwards) {
            direction = ['backward', 'forward'];
          } else {
            direction = ['forward', 'backward'];
          }

          if (anchorOffset) {
            //|vous patate
            selection.modify('move', direction[1], 'word');
          }
          //|vous pata|te
          selectedText.extend(endNode, endOffset);
          if (selectedText.focusOffset !== 0) {
            //|vous patate|
            selectedText.modify('extend', direction[0], 'word');
          }
        }
      }
    );

    let alreadyIncluded: string[] = [];
    for (const t of this.textAsArray) {
      let span: any | null = null;
      if (this.selectedTerms.includes(t) && !alreadyIncluded.includes(t)) {
        alreadyIncluded.push(t);
        span = this.renderer.createElement('span');
        const text = this.renderer.createText(t);
        this.renderer.appendChild(span, text);
        span.setAttribute('class', 'selected');
        this.renderer.appendChild(this.editTagElementRef?.nativeElement, span);
      } else {
        span = this.renderer.createElement('span');
        const text = this.renderer.createText(t);
        this.renderer.appendChild(span, text);
        this.renderer.appendChild(this.editTagElementRef?.nativeElement, span);
      }
      this.spanArray.push(span);

      this.renderer.listen(span, 'click', (event) => {
        const text = event.target.innerText;

        // L'element est déja selectionné
        if (event.target.classList.contains('selected')) {
          event.target.setAttribute('class', '');
          const i = this.selectedTerms.indexOf(text);
          this.selectedTerms.splice(i, 1);
        } else {
          // voir si le mot est contenu dans spanArray et a la class selected
          const i = this.spanArray.findIndex((s) => {
            return (
              s.classList.contains('selected') &&
              s.innerText === event.target.innerText
            );
          });

          if (i > -1) {
            this.spanArray[i].setAttribute('class', '');
          } else {
            this.selectedTerms.push(event.target.innerText);
          }
          event.target.setAttribute('class', 'selected');
        }
      });
      const space = this.renderer.createText(' ');
      this.renderer.appendChild(this.editTagElementRef?.nativeElement, space);
    }
  }

  ngOnInit(): void {}

  public switchBetweenTextAreaAndTags() {
    this.editTagMode = !this.editTagMode;
  }
}
