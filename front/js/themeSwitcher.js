function switchTheme() {
    console.log("Cookie avant le changement de thème :", getCookie("theme"));

    var theme = getCookie("theme");
    if (theme !== "theme2") {
        setCookie("theme", "theme2", 365);
    } else {
        setCookie("theme", "theme1", 365);
    }
    console.log("Cookie après le changement de thème :", getCookie("theme"));

    window.top.location.href = "../index.html";
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}