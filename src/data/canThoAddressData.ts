export type CanThoDistrict = {
    value: string;
    labelVi: string;
    wards: Array<{
        value: string;
        labelVi: string;
    }>;
};

export const canThoDistricts: CanThoDistrict[] = [
    {
        value: 'Ninh Kieu',
        labelVi: 'Ninh Kiều',
        wards: [
            { value: 'An Cu', labelVi: 'An Cư' },
            { value: 'An Hoa', labelVi: 'An Hòa' },
            { value: 'An Nghiep', labelVi: 'An Nghiệp' },
            { value: 'An Phu', labelVi: 'An Phú' },
            { value: 'Cai Khe', labelVi: 'Cái Khế' },
            { value: 'Hung Loi', labelVi: 'Hưng Lợi' },
            { value: 'Tan An', labelVi: 'Tân An' },
            { value: 'Thoi Binh', labelVi: 'Thới Bình' },
            { value: 'Xuan Khanh', labelVi: 'Xuân Khánh' },
        ],
    },
    {
        value: 'Binh Thuy',
        labelVi: 'Bình Thủy',
        wards: [
            { value: 'An Thoi', labelVi: 'An Thới' },
            { value: 'Binh Thuy', labelVi: 'Bình Thủy' },
            { value: 'Long Hoa', labelVi: 'Long Hòa' },
            { value: 'Long Tuyen', labelVi: 'Long Tuyền' },
            { value: 'Thoi An Dong', labelVi: 'Thới An Đông' },
            { value: 'Tra An', labelVi: 'Trà An' },
            { value: 'Tra Noc', labelVi: 'Trà Nóc' },
            { value: 'Bui Huu Nghia', labelVi: 'Bùi Hữu Nghĩa' },
        ],
    },
    {
        value: 'Cai Rang',
        labelVi: 'Cái Răng',
        wards: [
            { value: 'Ba Lang', labelVi: 'Ba Láng' },
            { value: 'Hung Phu', labelVi: 'Hưng Phú' },
            { value: 'Hung Thanh', labelVi: 'Hưng Thạnh' },
            { value: 'Le Binh', labelVi: 'Lê Bình' },
            { value: 'Phu Thu', labelVi: 'Phú Thứ' },
            { value: 'Tan Phu', labelVi: 'Tân Phú' },
            { value: 'Thuong Thanh', labelVi: 'Thường Thạnh' },
        ],
    },
    {
        value: 'OMon',
        labelVi: 'Ô Môn',
        wards: [
            { value: 'Chau Van Liem', labelVi: 'Châu Văn Liêm' },
            { value: 'Long Hung', labelVi: 'Long Hưng' },
            { value: 'Phuoc Thoi', labelVi: 'Phước Thới' },
            { value: 'Thoi An', labelVi: 'Thới An' },
            { value: 'Thoi Hoa', labelVi: 'Thới Hòa' },
            { value: 'Thoi Long', labelVi: 'Thới Long' },
            { value: 'Thoi Thuan', labelVi: 'Thới Thuận' },
        ],
    },
    {
        value: 'Thot Not',
        labelVi: 'Thốt Nốt',
        wards: [
            { value: 'Tan Hung', labelVi: 'Tân Hưng' },
            { value: 'Thanh Hoa', labelVi: 'Thạnh Hòa' },
            { value: 'Thanh Phu', labelVi: 'Thạnh Phú' },
            { value: 'Thuan An', labelVi: 'Thuận An' },
            { value: 'Trung Kien', labelVi: 'Trung Kiên' },
            { value: 'Trung Nhut', labelVi: 'Trung Nhứt' },
            { value: 'Thot Not Ward', labelVi: 'Thốt Nốt' },
            { value: 'Tan Loc', labelVi: 'Tân Lộc' },
        ],
    },
    {
        value: 'Phong Dien',
        labelVi: 'Phong Điền',
        wards: [
            { value: 'Giai Xuan', labelVi: 'Giai Xuân' },
            { value: 'My Khanh', labelVi: 'Mỹ Khánh' },
            { value: 'Nhon Ai', labelVi: 'Nhơn Ái' },
            { value: 'Nhon Nghia', labelVi: 'Nhơn Nghĩa' },
            { value: 'Tan Thoi', labelVi: 'Tân Thới' },
            { value: 'Truong Long', labelVi: 'Trường Long' },
            { value: 'Phong Dien Town', labelVi: 'Thị trấn Phong Điền' },
        ],
    },
    {
        value: 'Co Do',
        labelVi: 'Cờ Đỏ',
        wards: [
            { value: 'Co Do Town', labelVi: 'Thị trấn Cờ Đỏ' },
            { value: 'Dong Hiep', labelVi: 'Đông Hiệp' },
            { value: 'Dong Thang', labelVi: 'Đông Thắng' },
            { value: 'Dong Thanh', labelVi: 'Đông Thạnh' },
            { value: 'Dong Thuan', labelVi: 'Đông Thuận' },
            { value: 'Thoi Dong', labelVi: 'Thới Đông' },
            { value: 'Thoi Xuan', labelVi: 'Thới Xuân' },
            { value: 'Thoi Hung', labelVi: 'Thới Hưng' },
            { value: 'Trung An', labelVi: 'Trung An' },
            { value: 'Trung Hung', labelVi: 'Trung Hưng' },
        ],
    },
    {
        value: 'Thoi Lai',
        labelVi: 'Thới Lai',
        wards: [
            { value: 'Thoi Lai Town', labelVi: 'Thị trấn Thới Lai' },
            { value: 'Dinh Mon', labelVi: 'Định Môn' },
            { value: 'Dong Binh', labelVi: 'Đông Bình' },
            { value: 'Dong Thuan', labelVi: 'Đông Thuận' },
            { value: 'Truong Thanh', labelVi: 'Trường Thành' },
            { value: 'Truong Xuan', labelVi: 'Trường Xuân' },
            { value: 'Truong Xuan A', labelVi: 'Trường Xuân A' },
            { value: 'Thoi Tan', labelVi: 'Thới Tân' },
            { value: 'Thoi Thanh', labelVi: 'Thới Thạnh' },
            { value: 'Xuan Thang', labelVi: 'Xuân Thắng' },
        ],
    },
    {
        value: 'Vinh Thanh',
        labelVi: 'Vĩnh Thạnh',
        wards: [
            { value: 'Vinh Thanh Town', labelVi: 'Thị trấn Vĩnh Thạnh' },
            { value: 'Thanh An', labelVi: 'Thạnh An' },
            { value: 'Thanh Loc', labelVi: 'Thạnh Lộc' },
            { value: 'Thanh My', labelVi: 'Thạnh Mỹ' },
            { value: 'Thanh Pho', labelVi: 'Thạnh Phú' },
            { value: 'Thanh Quoi', labelVi: 'Thạnh Quới' },
            { value: 'Thanh Thang', labelVi: 'Thạnh Thắng' },
            { value: 'Thanh Tien', labelVi: 'Thạnh Tiến' },
            { value: 'Trung Hung', labelVi: 'Trung Hưng' },
            { value: 'Trung Thanh', labelVi: 'Trung Thạnh' },
        ],
    },
];

export const canThoProvinceLabel = 'Cần Thơ';

export const getCanThoDistrict = (districtValue: string) => {
    return canThoDistricts.find((district) => district.value === districtValue) ?? null;
};

export const getCanThoWards = (districtValue: string) => {
    return getCanThoDistrict(districtValue)?.wards ?? [];
};

export const formatCanThoAddress = (detail: string, wardValue: string, districtValue: string) => {
    const district = getCanThoDistrict(districtValue);
    const ward = district?.wards.find((item) => item.value === wardValue);

    const parts = [detail.trim(), ward?.labelVi ?? '', district?.labelVi ?? '', canThoProvinceLabel]
        .map((part) => part.trim())
        .filter(Boolean);

    return parts.join(', ');
};

export const parseCanThoAddress = (address?: string) => {
    if (!address) {
        return {
            detail: '',
            district: '',
            ward: '',
        };
    }

    const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length < 3) {
        return {
            detail: address.trim(),
            district: '',
            ward: '',
        };
    }

    const districtLabel = parts[parts.length - 2];
    const wardLabel = parts[parts.length - 3];
    const district = canThoDistricts.find((item) => item.labelVi === districtLabel);
    const ward = district?.wards.find((item) => item.labelVi === wardLabel);

    if (!district || !ward) {
        return {
            detail: address.trim(),
            district: '',
            ward: '',
        };
    }

    return {
        detail: parts.slice(0, -3).join(', '),
        district: district.value,
        ward: ward.value,
    };
};