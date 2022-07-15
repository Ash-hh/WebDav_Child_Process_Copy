export enum MessageTypes {
    SUCCESS = 'Success',
    ERROR = 'Error',

    COPY = 'Copy',
    GETCOUNT = 'GetCount'
}

export type Message = {
    type: MessageTypes
    count?: number
    errorMessage?: string 
}

export type MessageFromMain = {
    type: MessageTypes
    path?:string
    fileName?:string
}

export type FileInfo = {
    fileName:string,
    path:string
}


