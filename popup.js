const WEB_URL = "http://etl.data.sayweee.net/home"
const clickCheckBtn = document.getElementById("clickCheck")
const clickCheckNotRunBtn = document.getElementById("clickCheckNotRun")

//获取当前tab信息
async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}


//检查ETL执行展示在页面的问题 此方法中为页面中的doucment
// function checkRunErr() {}

//往页面注入样式
async function controlInsertCss(tabId) {
    await chrome.scripting.removeCSS({
        files: ["insert.css"],
        target: { tabId: tabId },
    });
    await chrome.scripting.insertCSS({
        files: ["insert.css"],
        target: { tabId: tabId },
    });
}

//监听
clickCheckBtn.addEventListener("click", async () => {
    let tab = await getCurrentTab();

    //检查是否当前处于ETL网站
    if (!tab.url.startsWith(WEB_URL)) {
        const clickCheckResDom = document.getElementById("clickCheckRes")
        clickCheckResDom.innerHTML = "您当前不处于ETL页面: http://etl.data.sayweee.net/home"
        return
    }

    await controlInsertCss(tab.id)

    //执行content页内js
    // chrome.scripting.executeScript(
    //     {
    //         target: { tabId: tab.id },
    //         func: checkRunErr,
    //         // args:[] //传递给func的参数
    //     },
    //     (res) => {}
    // );

    // 在独立文件执行content脚本方式
    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            files: ['script/check-delay.js']
        },
        (res) => {
            const clickCheckResDom = document.getElementById("clickCheckRes")
            //获取调用content页返回的结果
            const { delayCheckTotal, delayNum, errCheckTotal, errNum, errMsg } = res[0].result
            if (errMsg) {
                clickCheckResDom.innerHTML = `${errMsg}`
                return
            }
            const now = new Date();
            const time = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
            const delayCount = `延迟数：${delayNum} / 检查延迟总数：${delayCheckTotal} （仅daily）`
            const errCount = `报错数：${errNum} / 检查报错总数：${errCheckTotal} （All）`
            const clickCheckTime = `执行时间（本地）：${time}`
            clickCheckResDom.innerHTML = `
            <div>${delayCount}</div>
            <div>${errCount}</div>
            <div>${clickCheckTime}</div>
            `
            chrome.storage.local.set({
                ETL: {
                    delayCount,
                    errCount,
                    clickCheckTime
                }
            })
        }
    );
})

// 点击未跑按钮
clickCheckNotRunBtn.addEventListener("click", async () => {
    let tab = await getCurrentTab();

    //检查是否当前处于ETL网站
    if (!tab.url.startsWith(WEB_URL)) {
        const clickCheckNotRunResDom = document.getElementById("clickCheckNotRunRes")
        clickCheckNotRunResDom.innerHTML = "您当前不处于ETL页面: http://etl.data.sayweee.net/home"
        return
    }

    await controlInsertCss(tab.id)

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            files: ['script/check-not-run.js']
        },
        (res) => {
            const clickCheckNotRunResDom = document.getElementById("clickCheckNotRunRes")
            const { notRunCheckTotal, notRunNum, errMsg } = res[0].result
            if (errMsg) {
                clickCheckNotRunResDom.innerHTML = `${errMsg}`
                return
            }
            const now = new Date();
            const time = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
            const notRunCount = `未执行数：${notRunNum} / 检查总数：${notRunCheckTotal}`
            const notRunClickCheckTime = `执行时间（本地）：${time}`
            clickCheckNotRunResDom.innerHTML = `
            <div>${notRunCount}</div>
            <div>${notRunClickCheckTime}</div>
            `

            chrome.storage.local.set({
                ETL_NOT_RUN: {
                    notRunCount,
                    notRunClickCheckTime
                }
            })
        }
    )
})

async function init() {
    const data = await chrome.storage.local.get("ETL")
    const { delayCount, errCount, clickCheckTime } = data.ETL
    if (clickCheckTime) {
        document.getElementById("clickCheckRes").innerHTML = `
        <div>上次成功执行结果：</div>
        <div>${delayCount}</div>
        <div>${errCount}</div>
        <div>${clickCheckTime}</div>
        `
    }
    const data2 = await chrome.storage.local.get("ETL_NOT_RUN")
    const { notRunCount, notRunClickCheckTime } = data2.ETL_NOT_RUN
    if (notRunClickCheckTime) {
        document.getElementById("clickCheckNotRunRes").innerHTML = `
        <div>上次成功执行结果：</div>
        <div>${notRunCount}</div>
        <div>${notRunClickCheckTime}</div>
        `
    }
}

(function () {
    init()
})()

