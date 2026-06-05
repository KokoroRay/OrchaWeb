const fs = require('fs');
const path = require('path');

const dir = 'd:/FPT/Semester_7/EXE101/exe-web/bucheoh/src';

const walk = d => {
    let res = [];
    fs.readdirSync(d).forEach(f => {
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) res = res.concat(walk(p));
        else if (p.endsWith('.tsx') || p.endsWith('.ts')) res.push(p);
    });
    return res;
};

const files = walk(dir);

const mapping = {
    'FaChevronUp': 'FiChevronUp',
    'FaFacebookF': 'FiFacebook',
    'FaInstagram': 'FiInstagram',
    'FaYoutube': 'FiYoutube',
    'SiZalo': 'FiMessageCircle',
    'MdLocationOn': 'FiMapPin',
    'FaMapMarkerAlt': 'FiMapPin',
    'MdEmail': 'FiMail',
    'FaEnvelope': 'FiMail',
    'MdPhone': 'FiPhone',
    'FaPhone': 'FiPhone',
    'FaBars': 'FiMenu',
    'FaTimes': 'FiX',
    'FaHome': 'FiHome',
    'FaInfoCircle': 'FiInfo',
    'FaBoxOpen': 'FiBox',
    'FaPackage': 'FiPackage',
    'FaUser': 'FiUser',
    'FaSignOutAlt': 'FiLogOut',
    'FaShoppingCart': 'FiShoppingCart',
    'FaSearch': 'FiSearch',
    'FaTwitter': 'FiTwitter',
    'FaLinkedin': 'FiLinkedin',
    'FaCopy': 'FiCopy',
    'FaShare': 'FiShare2',
    'FaLeaf': 'FiWind',
    'FaSeedling': 'FiSun',
    'FaFlask': 'FiActivity',
    'FaWater': 'FiDroplet',
    'FaTint': 'FiDroplet',
    'FaRecycle': 'FiRefreshCcw',
    'FaFireAlt': 'FiZap',
    'FaArrowRight': 'FiArrowRight',
    'FaArrowLeft': 'FiArrowLeft',
    'FaBacteria': 'FiCpu',
    'FaThermometerHalf': 'FiThermometer',
    'FaCheckCircle': 'FiCheckCircle',
    'MdVerified': 'FiCheckCircle',
    'FaIndustry': 'FiHexagon',
    'FaChevronDown': 'FiChevronDown',
    'FaStar': 'FiStar',
    'FaRegStar': 'FiStar',
    'FaImage': 'FiImage',
    'FaPaperPlane': 'FiSend'
};

files.forEach(f => {
    let cnt = fs.readFileSync(f, 'utf8');
    let changed = false;

    for (const [o, n] of Object.entries(mapping)) {
        const r = new RegExp('\\b' + o + '\\b', 'g');
        if (r.test(cnt)) {
            cnt = cnt.replace(r, n);
            changed = true;
        }
    }

    if (changed) {
        const imports = [];
        let newCnt = cnt.replace(/import\s+\{([^}]+)\}\s+from\s+'react-icons\/[^']+';?\r?\n/g, (m, p1) => {
            const names = p1.split(',').map(n => n.trim()).filter(Boolean);
            names.forEach(n => imports.push(n));
            return '';
        });

        if (imports.length > 0) {
            const uniqueImports = [...new Set(imports)].sort();
            const fiImports = uniqueImports.filter(n => n.startsWith('Fi'));
            const otherImports = uniqueImports.filter(n => !n.startsWith('Fi'));
            
            let importStr = '';
            if (fiImports.length > 0) importStr += `import { ${fiImports.join(', ')} } from 'react-icons/fi';\n`;
            if (otherImports.length > 0) {
                const faImports = otherImports.filter(n => n.startsWith('Fa'));
                if (faImports.length > 0) importStr += `import { ${faImports.join(', ')} } from 'react-icons/fa';\n`;
                const mdImports = otherImports.filter(n => n.startsWith('Md'));
                if (mdImports.length > 0) importStr += `import { ${mdImports.join(', ')} } from 'react-icons/md';\n`;
                const siImports = otherImports.filter(n => n.startsWith('Si'));
                if (siImports.length > 0) importStr += `import { ${siImports.join(', ')} } from 'react-icons/si';\n`;
            }

            const lastImportIndex = newCnt.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
                const endOfLastImport = newCnt.indexOf('\n', lastImportIndex);
                newCnt = newCnt.slice(0, endOfLastImport + 1) + importStr + newCnt.slice(endOfLastImport + 1);
            } else {
                newCnt = importStr + newCnt;
            }
        }
        fs.writeFileSync(f, newCnt, 'utf8');
        console.log('Updated', f);
    }
});
