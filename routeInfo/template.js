export const template = {
    route: {
        outbound: "Flight Plan",
        inbound: " Flight Plan",
    },
    radio: {
        outbound: {
            DEP: {
                GND: "121.875",
                GND2: "122.6",
                TWR: "118.4",
                DEP: "123.8",
                DEP2: "133.825"
            },
            DALOL: "HKG 118.925",
            ENVAR: "TPE 129.1",
            OTHER: "",
            ARR: {
                APP: "",
				TWR: "",
                GND_W: "",
                GND_E: ""
            }
        },
        inbound: {
            DEP: {
                GND_E: "",
                GND_W: "1",
                TWR: "11",
                DEP: "",
                
            },
            MORE: "",
            ELATO: "HKG 121.3",
            MAGOG: "HKG RAD 126.5",
            ABBEY: "HKG ARR",
            ARR: {
                ARR: "119.1",
                DIR: "119.5",
                TWR: "118.7",
                GND: "122.6",
                GND2: "121.875",
            }
        }
    }
};