import { useState, useEffect } from "react";
import { Box } from "@mui/joy";
import {
    Autocomplete,
    createFilterOptions,
    ListItem,
    IconButton,
    Popper,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface SelectWithAddAndEditProps {
    id: string;
    options: OptionType[];
    error?: boolean;
    required?: boolean;
    placeholder?: string;
    currentValue?: string | null;
    onChange: (newValue: OptionType | null) => void;
    onEdit?: (option: OptionType) => void;
    onAddNew: (inputValue: string) => void;
}

export interface OptionType {
    key: number;
    inputValue: string;
    isAddNew?: boolean;
}

export const SelectWithAddAndEdit = ({
    id,
    options,
    error = false,
    required = false,
    placeholder = "Find or create...",
    currentValue,
    onChange,
    onEdit,
    onAddNew,
}: SelectWithAddAndEditProps) => {
    const { t } = useTranslation();

    const [value, setValue] = useState<OptionType | null>(null);

    // Set the initial value based on the currentValue prop
    useEffect(() => {
        if (!currentValue) return;

        const selectedOption = options.find(option => option.inputValue === currentValue) || null;
        setValue(selectedOption);
    }, [currentValue, options]);

    const filter = createFilterOptions<OptionType>();

    return (
        <Box position="relative">
            <Autocomplete
                id={id}
                data-testid={id}
                value={value}
                onChange={(_, newValue) => {
                    if (newValue && typeof newValue !== "string" && newValue.isAddNew) {
                        onAddNew(newValue.inputValue);
                        return;
                    }
                    setValue(newValue as OptionType | null);
                    onChange(newValue as OptionType | null);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        const inputValue = (e.target as HTMLInputElement).value.trim();
                        if (inputValue) {
                            const existingOption = options.find(
                                (option) => inputValue.toLowerCase() === option.inputValue.toLowerCase()
                            );

                            if (existingOption) {
                                setValue(existingOption as OptionType);
                                onChange(existingOption as OptionType);
                            } else {
                                onAddNew(inputValue);
                            }
                        }
                    }
                }}
                filterOptions={(options, params) => {
                    const filtered = filter(options, params);
                    const { inputValue } = params;

                    const isExisting = options.some(
                        (option) => inputValue.toLowerCase() === option.inputValue.toLowerCase()
                    );
                    if (inputValue && !isExisting) {
                        filtered.push({
                            key: -1,
                            inputValue,
                            isAddNew: true,
                        });
                    }

                    return filtered;
                }}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                options={options}
                getOptionLabel={(option) => {
                    if (typeof option === "string") {
                        return option;
                    }
                    return option.inputValue || "";
                }}
                freeSolo
                sx={{
                    "& .MuiInputBase-root.MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        fontSize: "14px",
                        padding: "4px 2px",
                    },
                    "&:hover .edit-button, &.Mui-focused .edit-button": {
                        visibility: 'visible',
                    },
                }}
                renderOption={(props, option) => (
                    <ListItem
                        {...props}
                        key={option.key}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "4px 8px",
                        }}>

                        <Typography
                            sx={{
                                fontSize: "14px",
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                            }}
                        >
                            {option.isAddNew ? (
                                <>
                                    {t("selectWithAddAndEdit.add")} "
                                    <span style={{ fontStyle: 'italic' }}>{option.inputValue}</span>
                                    "
                                </>
                            ) : (
                                option.inputValue
                            )}
                        </Typography>
                        {onEdit && !option.isAddNew && (
                            <IconButton
                                size="small"
                                aria-label="Edit"
                                data-testid={`${id}-edit-${option.key}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(option);
                                }}
                            >
                                <Tooltip title={t("selectWithAddAndEdit.edit")}>
                                    <Edit fontSize="small" />
                                </Tooltip>
                            </IconButton>
                        )}
                    </ListItem>
                )}
                PopperComponent={(props) => (
                    <Popper
                        {...props}
                        style={{
                            zIndex: 20,
                            width: "100%",
                            overflow: "hidden",
                        }}
                        disablePortal
                    />
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        size="small"
                        placeholder={placeholder}
                        required={required}
                        error={error}
                        aria-label="Find or create an option"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        position: 'relative',
                                        paddingRight: '32px',
                                    }}
                                >
                                    {value && !value.isAddNew && onEdit && (
                                        <IconButton
                                            size="small"
                                            aria-label="Edit"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(value);
                                            }}
                                            className="edit-button"
                                            sx={{
                                                visibility: 'hidden',
                                                padding: '2px',
                                                marginRight: '3px',
                                            }}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    )}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            right: 0,
                                        }}
                                    >
                                        {params.InputProps.endAdornment}
                                    </Box>
                                </Box>
                            ),
                        }}
                    />
                )}
            />
        </Box>
    );
};
