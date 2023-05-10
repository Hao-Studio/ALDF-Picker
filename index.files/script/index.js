console.info("Atomic 抽奖系统服务框架");
console.info("Version 4.1.230510.1 (Stable Release，BugFix Update，EOL)\nPowered By Atomic Innovations (原 Hao Studio)");
console.info("此系统已于 2023/05/10 正式 EOL，我们将不再进行任何维护！");
console.log("以下为调试日志。");
document.onkeyup = KBUP;
function KBUP() {
    if (window.event.keyCode == 32 && document.getElementById("Button").disabled == false) {
        console.log("检测到空格键事件，调用Luck_Draw函数。");
        Luck_Draw();
    }
}
var XMLHttp;
function CreateXMLHttpRequest()
{
    if (window.ActiveXObject) {
        console.info("创建了ActiveX控件的XMLHttpRequest对象。");
        try {
            XMLHttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                XMLHttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                XMLHttp = false;
            }
        }
    } else if (window.XMLHttpRequest) {
        console.info("创建了标准的XMLHttpRequest对象。");
        XMLHttp = new XMLHttpRequest();
    }
}
console.log("尝试创建XMLHttpRequest对象...");
CreateXMLHttpRequest();
function APISetup(apiKey) {
    console.log("尝试POST请求 api.random.org...");
    console.info("random.org API Key：" + apiKey);
    XMLHttp.open("POST","https://api.random.org/json-rpc/4/invoke", true);
    XMLHttp.timeout = 4000;
    XMLHttp.setRequestHeader("Content-Type","application/json");
    XMLHttp.send(JSON.stringify({"jsonrpc": "2.0","method": "generateIntegers","params": {"apiKey": apiKey,"n": 1,"min": 0,"max": 48,"replacement": false},"id": 24}));
}
function APICallback() {
    console.log("random.org API返回：" + XMLHttp.responseText);
    return (JSON.parse(XMLHttp.responseText));
}
function CheckNet() {
    console.info("检查网络连接...");
    if (navigator.onLine) {
        document.getElementById("NetState").innerHTML = "check";
        document.getElementById("NetState").className = "mdui-icon material-icons mdui-text-color-light-green";
        document.getElementById("Button").disabled = false;
        console.log("网络连接正常。");
    } else {
        document.getElementById("NetState").innerHTML = "error";
        document.getElementById("NetState").className = "mdui-icon material-icons mdui-text-color-red";
        mdui.snackbar({message:'此应用程序将以离线模式运行。',position:'bottom'});
        console.log("Entry PWA Offline Mode.");
    }
}
function GetcbState() {
    console.info("向 localStorage 获取cb开关状态值...");
    if (window.localStorage.getItem("cbState")) {
        console.log("cbState 键值存在。");
        if (window.localStorage.cbState == "true") {
            console.info("cb.checked==true, 设置cb开关状态为开。");
            return true;
        } else if (window.localStorage.cbState == "false") {
            console.info("cb.checked==false, 设置cb开关状态为关。");
            return false;
        }
    } else {
        console.info("cbState 在 localStorage 不存在值, 设置cb开关状态为开 (默认)。");
        window.localStorage.setItem("cbState","true");
        return true;
    }
}
function SetcbState() {
    console.info("保存cb开关状态...");
    if (document.getElementById("cb").checked == true) {
        window.localStorage.setItem("cbState","true");
    } else {
        window.localStorage.setItem("cbState","false");
    }
}
window.addEventListener('beforeinstallprompt',e => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return e.preventDefault();
    } else {
        var A2HSButton = document.getElementById("A2HSButton");
        A2HSButton.style.display = "block";
        A2HSButton.onclick = _ => e.prompt();
        return e.preventDefault();
    }
});
var CanSend;
function Luck_Draw() {
    console.log("Luck_Draw 函数已被调用。");
    console.log("按钮禁用。");
    document.getElementById("Button").disabled = true;
    if (!("Notification" in window)) {
        console.info("此浏览器不支持桌面通知，已忽略。");
        CanSend = false;
    } else if (Notification.permission === "granted") {
        console.info("用户已允许桌面通知权限，可以发送消息。");
        CanSend = true;
    } else if (Notification.permission === "denied" ||Notification.permission === "default") {
        console.warn("用户阻止了桌面通知权限。");
        CanSend = false;
        Notification.requestPermission().then(function (Permission) {
            if (Permission === "granted") {
                console.info("用户已允许桌面通知权限，可以发送消息。");
                CanSend = true;
            }
        })
    }
    console.log("显示进度条。");
    document.getElementById("progress").style.display = "block";
    console.log("显示SnackBar。");
    var $ = mdui.$;
    var SnackBar = mdui.snackbar({message:'正在处理请求...',position:'bottom',timeout:0});
    APISetup("15e65e2a-3e8d-4c00-9070-f701e67f4e64");
    XMLHttp.onload = function() {
        Load(APICallback().result.random.data[0]);
    }
    function GetRandomInt(Min,Max) {
        var byteArray = new Uint8Array(1);
        window.crypto.getRandomValues(byteArray);
        var Range = Max - Min + 1;
        var Max_Range = 256;
        if (byteArray[0] >= Math.floor(Max_Range / Range) * Range){return GetRandomInt(Min,Max);}
        return Min + (byteArray[0] % Range);
    }
    XMLHttp.onerror = function() {
        console.info("API 请求出错，或应用运行在离线模式下，使用本地密码学随机数。");
        Load(GetRandomInt(0,48));
    }
    XMLHttp.ontimeout = function() {
        console.info("API 请求 TIMED_OUT，被迫使用本地密码学随机数。");
        Load(GetRandomInt(0,48));
    }
    function Load(Choice) {
        console.info("种子决策随机数初始化...");
        var NumberArray = Array.from(Array(49).keys(),n => n + 1).sort(function(){return Math.random()-0.5});
        var Number = NumberArray[Choice];
        if (window.sessionStorage.getItem("Number")) {
            if (Number == window.sessionStorage.Number) {
                console.warn("随机数算法抛出了与上一次结果相同的数，进行重新决策。");
                Number = NumberArray.sort(function(){return Math.random()-0.5})[Choice];
            }
        }
        console.log("选择了索引号码为" + Choice + "的数。（即第" + (Choice + 1) + "个数）");
        console.log("关闭 SnackBar。");
        SnackBar.close();
        console.log("隐藏进度条。");
        document.getElementById("progress").style.display = "none";
        var h1Obj = document.getElementById("NumH1");
        h1Obj.innerHTML = "01";
        if (document.getElementById("cb").checked == true) {
            console.info("cb.checked==true, 音乐开始播放。");
            document.getElementById("sound").play();
        } else {
            console.info("cb.checked==false, 音乐不播放。");
        }
        console.log("Interval 启动。");
        var Interval = setInterval(NewStyle,125);
        var NewNum = 1;
        var Counter = 0;
        function NewStyle() {
            if (NewNum == Number) {
                console.log("Interval 停止。");
                clearInterval(Interval);
                console.log("音乐暂停。");
                document.getElementById("sound").pause();
                console.log("音乐重载。");
                document.getElementById("sound").load();
                console.info("展示抽奖结果并写入 Session：" + Number);
                window.sessionStorage.setItem("Number",Number);
                var Dialog = mdui.alert("抽中了" + Number + "号学生。","选择结果");
                console.log("按钮启用。");
                document.getElementById("Button").disabled=false;
                if (CanSend) {
                    console.info("发送桌面通知...");
                    var NotificationObject = new Notification("选择结果",{dir: "auto",lang: "zh-cn",body: "抽中了" + Number + "号学生。",tag: "com.atomic.hsir.pwa.notification",icon: "/index.files/image/appicon.png"});
                    NotificationObject.onshow = function () {
                        console.log("通知已展示。");
                    }
                    NotificationObject.onclick = function () {
                        console.log("通知被点击，关闭对话框。");
                        Dialog.close();
                    }
                    NotificationObject.onerror = function () {
                        console.error("通知发送错误。");
                    }
                    NotificationObject.onclose = function () {
                        console.log("通知已关闭。");
                    }
                }
            } else {
                NewNum = NumberArray[Counter];
                h1Obj.innerHTML = NewNum.toString().padStart(2,0);
                Counter += 1;
            }
        }
    }
}
function PageOnLoad() {
    CheckNet();
    document.getElementById("cb").checked = GetcbState();
    document.getElementById("cb").onclick = _ => SetcbState();
    var NumParam = new URLSearchParams(document.location.search.substring(1)).get("number");
    if (NumParam != null) {
        document.getElementById("NumH1").innerHTML = NumParam.padStart(2,0);
    }
    mdui.alert("此系统已于 2023/05/10 正式 EOL，我们将不再进行任何维护！","EOL");
}
window.onload = PageOnLoad