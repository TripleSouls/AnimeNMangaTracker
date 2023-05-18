const fs = require("fs");
const path = require("path");

module.exports = class DB{

    vals = {"vals" : []};
    fileName = "";

    constructor(){
        this.fileName = path.join(__dirname, "db.db");
        if(!fs.existsSync(this.fileName)){
            fs.writeFileSync(this.fileName, '{"vals" : []}');
        }

        let valsFromDB = fs.readFileSync(this.fileName).toString().trim();
        valsFromDB = (valsFromDB == "") ? '{"vals" : []}' : valsFromDB;
        
        valsFromDB = JSON.parse(valsFromDB);
        this.vals.vals = valsFromDB?.vals ?? [];

    }

    Add(anime){
        anime = {
            ...anime,
            id : anime?.id ?? -1,
            animeTitle : anime?.animeTitle ?? "",
            animeEpisodeWatched : anime?.animeEpisodeWatched ?? 0,
            animeStars : anime?.animeStars ?? 0
        }
        let check = true;
        this.vals.vals.forEach(readedAnime => {
            if(readedAnime.id == anime.id){
                check = false;
                readedAnime.animeTitle = anime.animeTitle;
                readedAnime.animeEpisodeWatched = anime.animeEpisodeWatched;
                readedAnime.animeStars = anime.animeStars;
            }
        });

        if(check) this.vals.vals.push(anime);
        this.SaveToFile();
    }

    Remove(id){
        let index = -1;
        for (let i = 0; i < this.vals.vals.length; i++) {
            const element = this.vals.vals[i];
            if(element.id == id){
                index = i;
                break;
            }
        }
        this.vals.vals.splice(index, 1);
        this.SaveToFile();
    }

    
    SaveToFile(){
        let val = JSON.stringify(this.vals);
        fs.writeFileSync(this.fileName, val);
    }

    GetAll(){
        return this.vals.vals;
    }

}