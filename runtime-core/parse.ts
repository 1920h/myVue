import { defaultOnError, defaultOnWarn, NO } from "../share"
import { createRoot } from "./ast"

export enum CharCodes {
    Tab = 0x9, // "\t"
    NewLine = 0xa, // "\n"
    FormFeed = 0xc, // "\f"
    CarriageReturn = 0xd, // "\r"
    Space = 0x20, // " "
    ExclamationMark = 0x21, // "!"
    Number = 0x23, // "#"
    Amp = 0x26, // "&"
    SingleQuote = 0x27, // "'"
    DoubleQuote = 0x22, // '"'
    GraveAccent = 96, // "`"
    Dash = 0x2d, // "-"
    Slash = 0x2f, // "/"
    Zero = 0x30, // "0"
    Nine = 0x39, // "9"
    Semi = 0x3b, // ";"
    Lt = 0x3c, // "<"
    Eq = 0x3d, // "="
    Gt = 0x3e, // ">"
    Questionmark = 0x3f, // "?"
    UpperA = 0x41, // "A"
    LowerA = 0x61, // "a"
    UpperF = 0x46, // "F"
    LowerF = 0x66, // "f"
    UpperZ = 0x5a, // "Z"
    LowerZ = 0x7a, // "z"
    LowerX = 0x78, // "x"
    LowerV = 0x76, // "v"
    Dot = 0x2e, // "."
    Colon = 0x3a, // ":"
    At = 0x40, // "@"
    LeftSquare = 91, // "["
    RightSquare = 93, // "]"
}

export enum State {
    Text = 1,
  
    // interpolation
    InterpolationOpen,
    Interpolation,
    InterpolationClose,
  
    // Tags
    BeforeTagName, // After <
    InTagName,
    InSelfClosingTag,
    BeforeClosingTagName,
    InClosingTagName,
    AfterClosingTagName,
  
    // Attrs
    BeforeAttrName,
    InAttrName,
    InDirName,
    InDirArg,
    InDirDynamicArg,
    InDirModifier,
    AfterAttrName,
    BeforeAttrValue,
    InAttrValueDq, // "
    InAttrValueSq, // '
    InAttrValueNq,
  
    // Declarations
    BeforeDeclaration, // !
    InDeclaration,
  
    // Processing instructions
    InProcessingInstruction, // ?
  
    // Comments & CDATA
    BeforeComment,
    CDATASequence,
    InSpecialComment,
    InCommentLike,
  
    // Special tags
    BeforeSpecialS, // Decide if we deal with `<script` or `<style`
    BeforeSpecialT, // Decide if we deal with `<title` or `<textarea`
    SpecialStartSequence,
    InRCDATA,
  
    InEntity,
  
    InSFCRootTagName,
}

const defaultDelimitersOpen = new Uint8Array([123, 123]) // "{{"
const defaultDelimitersClose = new Uint8Array([125, 125])

class Tokenizer{

    buffer:string = ""
    index: number = 0
    newlines: number[] = []
    state: State = State.Text
    sectionStart: number = 0
    delimiterIndex: number = 0
    inRCDATA: boolean = false

    reset(){}

    stateText(c: number){
        // <
        if(c === CharCodes.Lt){
            this.state = State.BeforeTagName
            this.sectionStart = this.index
        }else if(c === defaultDelimitersOpen[0]){
            this.state = State.InterpolationOpen
            this.delimiterIndex = 0
            this.stateInterpolationOpen(c)
        }
    }

    stateInterpolationOpen(c: number){
        if(c === defaultDelimitersOpen[this.delimiterIndex]){
            if( this.delimiterIndex === defaultDelimitersOpen.length - 1 ){
                const start = this.index + 1 - defaultDelimitersOpen.length
                if(start > this.sectionStart){
                    // TODO
                }
                this.state = State.Interpolation
                this.sectionStart = start
            }else{
                this.delimiterIndex++
            }
        }else if(this.inRCDATA){
            this.state = State.InRCDATA
            // TODO
        }else{
            this.state = State.Text
            this.stateText(c)
        }
    }

    parse(source: string){
        this.buffer = source
        while(this.index < this.buffer.length){
            const c = this.buffer.charCodeAt(this.index)
            if(c === CharCodes.NewLine){
                this.newlines.push(this.index)
            }
            switch(this.state){
                case State.Text:
                    this.stateText(c)
                    break
                case State.InterpolationOpen:
                    this.stateInterpolationOpen(c)
                    break
                case State.Interpolation:
                    break
            }
            this.index++
        }
    }
    getPos(start: number){
        return 0
    }
}


let currentInput = ''
let currentRoot: any = null
let currentOpenTag:  any = null
let currentProp: any = null
let currentAttrValue = ''
let currentAttrStartIndex = -1
let currentAttrEndIndex = -1
let inPre = 0
let inVPre = false
let currentVPreBoundary: any= null
const stack: any = []
const tokenizer = new Tokenizer()

export enum Namespaces {
    HTML,
    SVG,
    MATH_ML,
  }


export const defaultParserOptions = {
    parseMode: 'base',
    ns: Namespaces.HTML,
    delimiters: [`{{`, `}}`],
    getNamespace: () => Namespaces.HTML,
    isVoidTag: NO,
    isPreTag: NO,
    isIgnoreNewlineTag: NO,
    isCustomElement: NO,
    onError: defaultOnError,
    onWarn: defaultOnWarn,
    comments: true,
    prefixIdentifiers: false,
}

function getSlice(start: number, end: number) {
    return currentInput.slice(start, end)
}

function getLoc(start: number, end?: number) {
    return {
      start: tokenizer.getPos(start),
      end: end == null ? end : tokenizer.getPos(end),
      source: end == null ? end : getSlice(start, end),
    }
  }

function reset() {
    tokenizer.reset()
    currentOpenTag = null
    currentProp = null
    currentAttrValue = ''
    currentAttrStartIndex = -1
    currentAttrEndIndex = -1
    stack.length = 0
}

function condenseWhitespace(nodes: any[], tag?: any){

    return nodes
}

export function baseParse(input: string, options?: any){
    const root = currentRoot = createRoot([], input)
    tokenizer.parse(input)
    root.loc = getLoc(0, input.length)
    root.children = condenseWhitespace(root.children)
    currentRoot = null
    return root
}