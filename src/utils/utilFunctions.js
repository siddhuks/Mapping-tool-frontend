function extractHierarchyOG(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    function traverse(node) {
        const result = [];
        let currentH1 = null;
        let currentH2 = null;
        for (let childNode of node.childNodes) {
            if (childNode.nodeType === Node.ELEMENT_NODE && childNode.tagName.startsWith('H')) {
                if (childNode.tagName === 'H1') {
                    currentH1 = {
                        tag: childNode.tagName,
                        text: childNode.textContent,
                        child: [],
                        ref: childNode.getAttribute('ref'),
                    };
                    result.push(currentH1);
                    currentH2 = null; // Reset currentH2 when encountering H1
                } else if (childNode.tagName === 'H2' && currentH1) {
                    currentH2 = {
                        tag: childNode.tagName,
                        text: childNode.textContent,
                        child: [],
                        ref: childNode.getAttribute('ref')
                    };
                    currentH1.child.push(currentH2);
                } else if (childNode.tagName === 'H3') {
                    if (currentH2) {
                        const h3Node = {
                            tag: childNode.tagName,
                            text: childNode.textContent,
                            child: [],
                            ref: childNode.getAttribute('ref')
                        };
                        currentH2.child.push(h3Node);
                    } else if (currentH1) {
                        const h3Node = {
                            tag: childNode.tagName,
                            text: childNode.textContent,
                            child: [],
                            ref: childNode.getAttribute('ref')
                        };
                        currentH1.child.push(h3Node);
                    }
                }
            }
        }
        return result;
    }

    return traverse(doc.body);
}

function extractHierarchyOG1(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    function traverse(node) {
        const result = [];
        let currentH1 = null;
        let currentH2 = null;
        for (let childNode of node.childNodes) {
            if (childNode.nodeType === Node.ELEMENT_NODE && childNode.tagName.startsWith('H')) {
                if (childNode.tagName === 'H1') {
                    currentH1 = {
                        tag: childNode.tagName,
                        text: childNode.textContent,
                        child: [],
                        ref: childNode.getAttribute('ref'),
                    };
                    result.push(currentH1);
                    currentH2 = null; // Reset currentH2 when encountering H1
                } else if (childNode.tagName === 'H2') {
                    if (!currentH2) {
                        currentH2 = {
                            tag: childNode.tagName,
                            text: childNode.textContent,
                            child: [],
                            ref: childNode.getAttribute('ref')
                        };
                        if (!currentH1) {
                            currentH1 = {
                                tag: "H1",
                                text: "",
                                child: [currentH2],
                                ref: ""
                            };
                            result.push(currentH1);
                        } else {
                            currentH1.child.push(currentH2);
                        }
                    } else {
                        currentH2 = {
                            tag: childNode.tagName,
                            text: childNode.textContent,
                            child: [],
                            ref: childNode.getAttribute('ref')
                        };
                        currentH1.child.push(currentH2);
                    }
                } else if (childNode.tagName === 'H3') {
                    if (!currentH1) {
                        currentH1 = {
                            tag: "H1",
                            text: "",
                            child: [],
                            ref: ""
                        };
                        result.push(currentH1);
                    }
                    if (!currentH2) {
                        currentH2 = {
                            tag: "H2",
                            text: "",
                            child: [],
                            ref: ""
                        };
                        currentH1.child.push(currentH2);
                    }
                    const h3Node = {
                        tag: childNode.tagName,
                        text: childNode.textContent,
                        child: [],
                        ref: childNode.getAttribute('ref')
                    };
                    currentH2.child.push(h3Node);
                }
            }
        }
        return result;
    }

    return traverse(doc.body);
}

function extractHierarchy(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    function traverse(node) {
        const result = [];
        let currentH1 = null;
        let currentH2 = null;

        for (let childNode of node.childNodes) {
            if (childNode.nodeType === Node.ELEMENT_NODE && childNode.tagName.startsWith('H')) {
                if (childNode.tagName === 'H1') {
                    currentH1 = {
                        tag: childNode.tagName,
                        text: childNode.textContent,
                        child: [],
                        ref: childNode.getAttribute('ref')
                    };
                    result.push(currentH1);
                    currentH2 = null; // Reset currentH2 when encountering H1
                } else if (childNode.tagName === 'H2') {
                    if (currentH1) {
                        currentH2 = {
                            tag: childNode.tagName,
                            text: childNode.textContent,
                            child: [],
                            ref: childNode.getAttribute('ref')
                        };
                        currentH1.child.push(currentH2);
                    } else {
                        currentH1 = {
                            tag: 'H1',
                            text: '',
                            child: [],
                            ref: ''
                        };
                        result.push(currentH1);
                        currentH2 = {
                            tag: childNode.tagName,
                            text: childNode.textContent,
                            child: [],
                            ref: childNode.getAttribute('ref')
                        };
                        currentH1.child.push(currentH2);
                    }
                } else if (childNode.tagName === 'H3') {
                    if (currentH2) {
                        const h3Node = {
                            tag: childNode.tagName,
                            text: childNode.textContent,
                            child: [],
                            ref: childNode.getAttribute('ref')
                        };
                        currentH2.child.push(h3Node);
                    } else if (currentH1) {
                        currentH2 = {
                            tag: 'H2',
                            text: '',
                            child: [],
                            ref: ''
                        };
                        currentH1.child.push(currentH2);
                        const h3Node = {
                            tag: childNode.tagName,
                            text: childNode.textContent,
                            child: [],
                            ref: childNode.getAttribute('ref')
                        };
                        currentH2.child.push(h3Node);
                    } else {
                        currentH1 = {
                            tag: 'H1',
                            text: '',
                            child: [],
                            ref: ''
                        };
                        result.push(currentH1);
                        currentH2 = {
                            tag: 'H2',
                            text: '',
                            child: [],
                            ref: ''
                        };
                        currentH1.child.push(currentH2);
                        const h3Node = {
                            tag: childNode.tagName,
                            text: childNode.textContent,
                            child: [],
                            ref: childNode.getAttribute('ref')
                        };
                        currentH2.child.push(h3Node);
                    }
                }
            }
        }
        return result;
    }

    return removeEmptyText(traverse(doc.body));
}

function removeEmptyText(objects) {
    return objects.reduce((acc, obj) => {
        if (obj.text !== '') {
            acc.push(obj);
        } else {
            acc.push(...obj.child);
        }
        return acc;
    }, []);
}


const utilsFunctions = {
    extractHierarchy,
}

export default utilsFunctions;