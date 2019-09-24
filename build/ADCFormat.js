export var ContainerType;
(function (ContainerType) {
    ContainerType[ContainerType["XML"] = 0] = "XML";
    ContainerType[ContainerType["JSON"] = 1] = "JSON";
    ContainerType[ContainerType["CSV"] = 2] = "CSV";
    ContainerType[ContainerType["AMBDEC"] = 3] = "AMBDEC";
    ContainerType[ContainerType["CONFIG"] = 4] = "CONFIG";
})(ContainerType || (ContainerType = {}));
/* class decorator */
export function _static_implements() {
    return (constructor) => { constructor; };
}
;
