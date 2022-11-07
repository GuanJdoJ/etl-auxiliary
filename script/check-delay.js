//检查ETL执行展示在页面的问题 此方法中为页面中的doucment
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

    //总共对报错规则检查了多少项
    let errCheckTotal = lastRunDomList.length;
    //多少项报错
    let errNum = 0;
    // 总共对延迟则检查了多少项
    let delayCheckTotal = 0;
    //多少项有延迟
    let delayNum = 0;

    for (let i = 0; i < lastRunDomList.length; i++) {
        const lastRunItemDom = lastRunDomList[i];
        if (lastRunItemDom) {
            //整行Dom
            const lineItemDom = lastRunItemDom.parentNode;

            lineItemDom.classList.remove("etl-auxiliary-err", "etl-auxiliary-delay", "etl-auxiliary-not-run")

            //执行报错情况--stroke为red
            const circleDomList = lineItemDom.getElementsByTagName("circle")
            if (circleDomList) {
                for (let j = 0; j < circleDomList.length; j++) {
                    if (circleDomList[j].getAttribute("stroke") === "red") {
                        errNum++;
                        lineItemDom.classList.add("etl-auxiliary-err")
                        break;
                    }
                }
            }

            //获取上次执行时间
            let lastRunTime = new Date(lastRunItemDom.getElementsByTagName("time")[0].innerText)
            //ETL上上次执行时间有问题
            lastRunTime = new Date(lastRunTime.setDate(lastRunTime.getDate() + 1));

            //获取cron表达式
            const cron = lastRunItemDom.previousElementSibling.children[0].innerText;
            if (cron) {
                const cronArr = cron.split(" ");
                const cronMin = cronArr[0];
                const cronHours = cronArr[1];
                const cronDay = cronArr[2];
                const cronMonth = cronArr[3];
                const cronWeek = cronArr[4];
                //只检测daily-ETL
                if (Number(cronMin) >= 0 && Number(cronHours) >= 0 && cronDay === "*" && cronMonth === "*" && cronWeek === "*") {
                    //统计项+1
                    delayCheckTotal++;

                    //本日应当执行时间
                    const scheduleTime = new Date(`${currentYMDStr} ${cronHours}:${cronMin}`)
                    //当前时间超过了今日应当执行时间，并且上次执行时间不等于今日应当执行时间--告警
                    if (PDTTime > scheduleTime && getYMDStr(lastRunTime) != currentYMDStr) {
                        lineItemDom.classList.add("etl-auxiliary-delay")
                        //延迟项+1
                        delayNum++;
                    }

                }
            }
        }
    }


    // 如果有返回结果，可以通过此返回
    return {
        errCheckTotal,
        errNum,
        delayCheckTotal,
        delayNum
    };
})()