const { ipcRenderer } = require("electron");
window.$ = window.jQuery = require('jquery');

const timerForCountdown = 1.5;
let timer = 1.5;
let timerIsRunning = false;

let findedValueOfSearchedVal;
let tempObj = "";
let searchResultJSON = [];

document.addEventListener('DOMContentLoaded', function () {
    const input = document.querySelector("input#searchArea");
    const searchResultsDiv = document.querySelector("#searchResults");

    const productDetails = $('#productDetails');
    const tbodyAnimes = $(".tbodyAnimes");
    const tAnimeTab = $("#nav-animelist");

    const animeNameInput = $("#productDetails #animeName");
    const animeEpisodeInput = $("#productDetails #maxAnimeEpisodeNumber");
    const animeEpisodeWatchedInput = $("#watchedAnimeEpisodes");
    const animeStars = $("#animeStars");
    const saveButton = $("button[save]");

    //GetDatasFromBackend -start-
    ipcRenderer.send("GetVals", {});
    ipcRenderer.on("Vals", (e, args) => {
        UpdateAnimeTable(args);
    });

    function UpdateAnimeTable(args){
        tbodyAnimes.html("");
        let counter = 0;
        args.map((anime, index) => {
            let htmlCode = `
            <tr anime="${anime.id}">
                <td class="text-center">${index}</td>
                <td>${anime.animeTitle}</td>
                <td class="text-center">${anime.animeEpisodeWatched}</td>
                <td class="text-center">${anime.animeStars}/10</td>
                <td class="text-center"><button type="button" class="btn btn-outline-light btn-sm"><i
                    class="bi bi-pencil-square"></i></button></td>
            </tr>
            `;
            tbodyAnimes.append(htmlCode);
        });
        
        if(args.length==0)
        {
            tAnimeTab.append("<h3 class='text-center'>Kayıtlı anime bulunamadı.</h3>")
        }
    }

    //GetDatasFromBackend -end-

    saveButton.click((e) => {
        e.preventDefault();
        let obJSON = {
            id: saveButton.attr("save"),
            animeTitle: animeNameInput.val(),
            animeEpisodeWatched: parseInt(animeEpisodeWatchedInput.val()) === null || isNaN(parseInt(animeEpisodeWatchedInput.val())) === true || parseInt(animeEpisodeWatchedInput.val()) < 0  ? 0 : parseInt(animeEpisodeWatchedInput.val()),
            animeStars: parseInt(animeStars.val()) === null || isNaN(parseInt(animeStars.val())) === true || parseInt(animeStars.val()) < 0 ? 0 : parseInt(animeStars.val())
        }
        ipcRenderer.send("save", obJSON);
        ipcRenderer.on("saved", (e, args) => {
            if (!args.query) {
                alert(e.msg);
                return;
            }
            productDetails.modal('hide');
            ipcRenderer.send("GetVals", {});
        });
    })

    function CleanString(stringVal) {
        const regex = /(--|#|\/\*|\*\/|'|`|;|=|<|>|\|)/g;
        const temizString = stringVal.replace(regex, '');
        return temizString;
    }

    input.addEventListener("keyup", function (e) {
        if (e.key === "Enter" && !timerIsRunning) {
            console.log($("#searchResultsModal"));
            $('#searchResultsModal').modal('show'); //Modali Aktif Et

            timerIsRunning = true;
            timer = timerForCountdown;
            let temp = setInterval(function () {
                console.log("Geri sayım: " + timer);
                timer -= 0.5;
                if (timer <= 0) {
                    timerIsRunning = false;
                    clearInterval(temp);
                }
            }, 500)

            let stringValue = CleanString(input.value);

            let trimmedStringValue = stringValue.trim();

            if ((trimmedStringValue === null || trimmedStringValue === "")) {
            } else {
                ipcRenderer.send("searchedName", stringValue);
            }
        }
    });

    function DetailSystem() {
        let allSearchResults = document.querySelectorAll('.searchResult');

        allSearchResults.forEach(result => {
            result.addEventListener("click", function () {
                if (result.id) {

                    let values = GetValuesOfProduct(result.id);

                    productDetails.modal('show');

                    $("#productDetails h5.modal-title").html(values["Name"]);
                    animeNameInput.attr("value", values["Name"]);
                    $("#productDetails img").attr("src", values["Image"])
                    animeEpisodeInput.html(values["Episodes"])
                    saveButton.attr("save", result.id);

                    var maxValOfEpisodes = parseInt($('#maxAnimeEpisodeNumber').text());
                    console.log($('#maxAnimeEpisodeNumber').text());
                    console.log(maxValOfEpisodes);
                    animeEpisodeWatchedInput.attr({
                        "min": 0,
                        "max": maxValOfEpisodes
                    });
                    console.log($("#watchedAnimeEpisodes").attr);
                    animeEpisodeWatchedInput.on("input", function () {
                        if ($(this).val() > maxValOfEpisodes) {
                            $(this).val(maxValOfEpisodes);
                        } else if ($(this).val() < 0) {
                            $(this).val("0");
                        }
                    });

                } else {
                    console.log("ID Bulunamadi");
                }
            });
        });
    }

    function GetValuesOfProduct(id) {
        for (let i = 0; i < searchResultJSON.length; i++) {
            console.log(searchResultJSON[i].ID + "\n\t ID: " + id);
            if (searchResultJSON[i].ID == id) {
                return searchResultJSON[i];
            }
        }
        return null;
    }

    ipcRenderer.on("findedVal", (e, args) => {
        console.log(e);
        console.log(args);
        findedValueOfSearchedVal = args;

        let setHTMLResult = "";

        searchResultJSON = []

        for (let i = 0; i < args.data.length; i++) {
            setHTMLResult += '<div class="card mb-3 searchResult" id="' + args.data[i].mal_id + '" style="max-width: 540px;"><div class="row g-0"><div class="col-md-2"><img src="' + args.data[i].images.jpg.image_url + '" width="100%" height="125" alt=""></div><div class="col-md-8"><div class="card-body"><h5 class="card-title">' + args.data[i].title + ' <span class="badge bg-info">Anime</span></h5><p class="card-text"><small class="text-body-secondary">' + (args.data[i].episodes === null ? 0 : args.data[i].episodes) + ' Bölüm</small></p></div></div></div></div>';
            console.log("a");

            searchResultJSON.push({
                "ID": args.data[i].mal_id,
                "Name": args.data[i].title,
                "Image": args.data[i].images.jpg.image_url,
                "Episodes": (args.data[i].episodes === null ? 0 : args.data[i].episodes)
            })
        }

        searchResultsDiv.innerHTML = setHTMLResult;
        DetailSystem();
    });

    productDetails.on('show.bs.modal', function (e) {

    });

    function activateModal() {

    }
});