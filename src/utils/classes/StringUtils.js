class StringUtils {
    static parseArguments(str) {
        let s = str.match(/\w+|"(?:\\"|[^"])+"/g);
        for( var i=0 ; i<s.length ; i++ ) {
            s[i] = s[i].replace(/"/g,"");
        }
        return s;
    }
}

module.exports = StringUtils;