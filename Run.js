﻿/* First thing to do is to read the config and guess which bot we will be running. */

var fs = require('fs');
let vmConfig;

try {

    vmConfig = JSON.parse(fs.readFileSync('this.vm.config.json', 'utf8'));

}
catch (err) {
    const logText = "[ERROR] 'readConfig' - ERROR : " + err.message;
    console.log(logText);

    return;
}

/* Now we will read the config of the bot from the path we obtained on the VM config. */

let botConfig;

try {

    botConfig = JSON.parse(fs.readFileSync(vmConfig.bot.path + '/this.bot.config.json', 'utf8'));

}
catch (err) {
    const logText = "[ERROR] 'readConfig' - ERROR : " + err.message;
    console.log.write(logText);

    return;
}

let bot = {
    "name": botConfig.displayName,
    "type": botConfig.type,
    "version": botConfig.version,
    "devTeam": botConfig.devTeam
};

botConfig.bot;

/* Now we will run according to what we see at the config file. */

const ROOT_DIR = './';
const MODULE_NAME = "Run";

const DEBUG_MODULE = require(ROOT_DIR + 'Debug Log');
const logger = DEBUG_MODULE.newDebugLog();
logger.fileName = MODULE_NAME;
logger.bot = bot;

process.on('uncaughtException', function (err) {
    logger.write('uncaughtException - ' + err.message);
});


process.on('unhandledRejection', (reason, p) => {
    logger.write("Unhandled Rejection at: Promise " + JSON.stringify(p) + " reason: " + reason);
});


process.on('exit', function (code) {
    logger.write('About to exit with code:' + code);
});

const DEFAULT_OK_RESPONSE = {
    result: "Ok",
    message: "Operation Succeeded"
};

const DEFAULT_FAIL_RESPONSE = {
    result: "Fail",
    message: "Operation Failed"
};

const DEFAULT_RETRY_RESPONSE = {
    result: "Retry",
    message: "Retry Later"
}; 

if (bot.type === "trading") {

    let tradingBot = newTradingBot(bot, botConfig);
    tradingBot.initialize(onInitializeReady);

    function onInitializeReady(err) {

        if (err === null) {

            tradingBot.start(whenStartFinishes);

            function whenStartFinishes() {

                if (err === null) {

                    logger.write("[INFO] trading bot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully. :-)");

                } else {

                    logger.write("[ERR] trading bot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                    logger.write("[ERR] trading bot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                    logger.write("[ERR] trading bot -> onInitializeReady -> whenStartFinishes -> Bye. :-(");
                }
            }

        } else {
            logger.write("[ERR] trading bot -> onInitializeReady -> err = " + err.message);
            logger.write("[ERR] trading bot -> onInitializeReady -> Bot will not be started. " );
        }

    }
    return;
}

const START_ALL_MONTHS = false;
const START_ONE_MONTH = true;

const INTERVAL_EXECUTOR_MODULE = require('./Interval Executor');

/* Now we will see which are the script Arguments. We expect the name of the process to run, since that is what it should be defined at the Task Scheduller. */

let processToRun = process.argv[2];

for (let i = 0; i < botConfig.processes.length; i++) {

    if (botConfig.processes[i].name === processToRun) {

        let processConfig = botConfig.processes[i];

        bot.process = processConfig.name;

        try {

            /* We tesst each type of start Mode to get what to run and how. */

            if (processConfig.startMode.allMonths.run === "true") {

                for (let year = processConfig.startMode.allMonths.maxYear; year > processConfig.startMode.allMonths.minYear; year--) {

                    for (let month = 12; month > 0; month--) {

                        let timeDelay = Math.random() * 10 * 1000; // We introduce a short delay so as to not overload the machine.

                        setTimeout(startProcess, timeDelay);

                        function startProcess() {

                            const newIntervalExecutor = INTERVAL_EXECUTOR_MODULE.newIntervalExecutor(bot);

                            newIntervalExecutor.initialize(vmConfig.bot.path, processConfig, year, month, onInitializeReady);

                            function onInitializeReady() {

                                newIntervalExecutor.start();

                            }

                        }

                    }

                }

            }


            if (processConfig.startMode.oneMonth.run === "true") {

                startProcess();

                function startProcess() {

                    const newIntervalExecutor = INTERVAL_EXECUTOR_MODULE.newIntervalExecutor(bot);

                    newIntervalExecutor.initialize(vmConfig.bot.path, processConfig, processConfig.startMode.oneMonth.year, processConfig.startMode.oneMonth.month, onInitializeReady);

                    function onInitializeReady() {

                        newIntervalExecutor.start();

                    }
                }
            }


            if (processConfig.startMode.noTime.run === "true") {

                startProcess();

                function startProcess() {

                    const newIntervalExecutor = INTERVAL_EXECUTOR_MODULE.newIntervalExecutor(bot);

                    newIntervalExecutor.initialize(vmConfig.bot.path, processConfig, undefined, undefined, onInitializeReady);

                    function onInitializeReady() {

                        newIntervalExecutor.start();

                    }
                }
            }


        } catch (err) {
            console.log(err.message);
            logger.write(err.message);
        }
    }
}


