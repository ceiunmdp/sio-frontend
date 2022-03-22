export function dataUrlToBlob(dataurl: string): Blob {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], {type:mime});
}

export function removeAccents(originalString: string) {
    originalString = originalString.replace('Á','A')
    originalString = originalString.replace('É','E')
    originalString = originalString.replace('Í','I')
    originalString = originalString.replace('Ó','O')
    originalString = originalString.replace('Ú','U')
    originalString = originalString.replace('á','a')
    originalString = originalString.replace('é','e')
    originalString = originalString.replace('í','i')
    originalString = originalString.replace('ó','o')
    originalString = originalString.replace('ú','u')
    return originalString
}

export function dataURLtoFile(dataurl, filename): File {
 
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
}

export function b64ToArrayBuffer(base64: string): ArrayBuffer {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}