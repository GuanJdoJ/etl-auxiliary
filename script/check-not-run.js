(function () {
    //应该使用的时区
    const TIME_ZONE = 'PST (-08:00)'//冬令时 夏令时为PDT (-07:00)
    //当前PDT时间 15夏令时 16冬令时
    const PDTTime = new Date(new Date().getTime() - 16 * 60 * 60 * 1000);

    function getYMDStr(time) {
        return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
    }

    //调用函数时PDT月日 MM-DD
    const currentYMDStr = getYMDStr(PDTTime)

    //列表区域dom
    const dagsTableBodyDom = document.getElementsByClassName("dags-table-body")[0];
    if (!dagsTableBodyDom) {
        return {
            errMsg: '列表加载有问题，无法执行'
        }
    }

    // 获取时区，只有处于PDT -7:00才可使用
    const timeZoneDom = document.getElementById("clock")
    const timeZoneStr = timeZoneDom.children[0].innerText
    if (timeZoneStr !== TIME_ZONE) {
        return {
            errMsg: `请把时区调整到：${TIME_ZONE}`
        }
    }

    //获取列表区域所有Last Run列
    const lastRunDomList = dagsTableBodyDom.getElementsByClassName("latest_dag_run")
    if (!lastRunDomList) {
        return {
            errMsg: '列表加载有问题，无法执行'
        }
    }

    // 总共对延迟则检查了多少项
    let notRunCheckTotal = 0;
    //多少项有延迟
    let notRunNum = 0;

    for (let i = 0; i < lastRunDomList.length; i++) {
        const lastRunItemDom = lastRunDomList[i];
        if (lastRunItemDom) {
            notRunCheckTotal++;

            //整行Dom
            const lineItemDom = lastRunItemDom.parentNode;

            lineItemDom.classList.remove("etl-auxiliary-err", "etl-auxiliary-delay", "etl-auxiliary-not-run")

            //获取上次执行时间
            let lastRunTime = new Date(lastRunItemDom.getElementsByTagName("time")[0].innerText)
            //ETL上上次执行时间有问题
            lastRunTime = new Date(lastRunTime.setDate(lastRunTime.getDate() + 1));

            //上次执行YMD和当天YMD不相等，代表今日未执行
            if (getYMDStr(lastRunTime) != currentYMDStr) {
                lineItemDom.classList.add("etl-auxiliary-not-run")
                notRunNum++
            }
        }
    }

    return {
        notRunCheckTotal,
        notRunNum,
    };
})()