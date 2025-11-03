export interface LoggedInUser {
  id: string;
  name: string;
  encryptedPrivateKey: string;
}

export interface Town {
  id: string;
  name: string;
}

export interface Cactus {

  id: string;

  name: string;

  townId: string;

}



export interface Message {

  id: number;

  text: string;

  cactusId: string;

}
