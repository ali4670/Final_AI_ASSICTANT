export interface ASLAsset {
    char: string;
    url: string;
}

// Higher quality ASL Alphabet mapping (using accessible educational resources)
export const ASL_ALPHABET: Record<string, string> = {
    'a': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Sign_language_A.svg/100px-Sign_language_A.svg.png',
    'b': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Sign_language_B.svg/100px-Sign_language_B.svg.png',
    'c': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Sign_language_C.svg/100px-Sign_language_C.svg.png',
    'd': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Sign_language_D.svg/100px-Sign_language_D.svg.png',
    'e': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Sign_language_E.svg/100px-Sign_language_E.svg.png',
    'f': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Sign_language_F.svg/100px-Sign_language_F.svg.png',
    'g': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Sign_language_G.svg/100px-Sign_language_G.svg.png',
    'h': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Sign_language_H.svg/100px-Sign_language_H.svg.png',
    'i': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Sign_language_I.svg/100px-Sign_language_I.svg.png',
    'j': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Sign_language_J.svg/100px-Sign_language_J.svg.png',
    'k': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Sign_language_K.svg/100px-Sign_language_K.svg.png',
    'l': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Sign_language_L.svg/100px-Sign_language_L.svg.png',
    'm': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sign_language_M.svg/100px-Sign_language_M.svg.png',
    'n': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Sign_language_N.svg/100px-Sign_language_N.svg.png',
    'o': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Sign_language_O.svg/100px-Sign_language_O.svg.png',
    'p': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Sign_language_P.svg/100px-Sign_language_P.svg.png',
    'q': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Sign_language_Q.svg/100px-Sign_language_Q.svg.png',
    'r': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sign_language_R.svg/100px-Sign_language_R.svg.png',
    's': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Sign_language_S.svg/100px-Sign_language_S.svg.png',
    't': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Sign_language_T.svg/100px-Sign_language_T.svg.png',
    'u': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Sign_language_U.svg/100px-Sign_language_U.svg.png',
    'v': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Sign_language_V.svg/100px-Sign_language_V.svg.png',
    'w': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Sign_language_W.svg/100px-Sign_language_W.svg.png',
    'x': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Sign_language_X.svg/100px-Sign_language_X.svg.png',
    'y': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Sign_language_Y.svg/100px-Sign_language_Y.svg.png',
    'z': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Sign_language_Z.svg/100px-Sign_language_Z.svg.png',
};

export const getASLSign = (char: string) => {
    return ASL_ALPHABET[char.toLowerCase()] || null;
};
