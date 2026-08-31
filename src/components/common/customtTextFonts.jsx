import React from 'react';
import { colors } from "../colors/colors";

// ✅ Load Google Fonts dynamically (NO change to existing logic)
const loadGoogleFonts = () => {
  const link = document.createElement("link");
  link.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@400;500;600&family=Open+Sans:wght@400;500;600&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
};

// Call once
if (typeof document !== "undefined") {
  loadGoogleFonts();
}

const baseTextStyle = ({
  fontFamily,
  fontSize,
  fontWeight,
  fontStyle,
  color,
  textAlign,
  fontHeight,
  letterSpacing,
  underline,
  textDecoration,
  decorationColor,
  maxLines,
  overflow,
  softWrap,
}) => ({
  fontFamily: fontFamily,
  fontSize: fontSize || 16,
  fontWeight: fontWeight || 500,
  fontStyle: fontStyle || "normal",
  color: color || colors.textColor,
  textAlign: textAlign || "start",
  lineHeight: fontHeight || 1.4,
  letterSpacing: letterSpacing || 0,
  textDecoration:
    textDecoration || (underline ? "underline" : "none"),
  textDecorationColor: decorationColor,

  // ✅ FIX: changed from "block" to "inline"
  display: maxLines ? "-webkit-box" : "inline",

  WebkitLineClamp: maxLines,
  WebkitBoxOrient: maxLines ? "vertical" : "initial",
  overflow: maxLines ? "hidden" : overflow,
  textOverflow: maxLines ? "ellipsis" : overflow,

  // ✅ keep this (important for single line control)
  whiteSpace: softWrap === false ? "nowrap" : "normal",
});

//  Inter Text
export const InterText = (props) => {
  const style = baseTextStyle({
    ...props,
    fontFamily: "Inter",
  });

  return <span style={style}>{props.text}</span>;
}

//  Poppins Text
export const PoppinsText = (props) => {
  const style = baseTextStyle({
    ...props,
    fontFamily: "Poppins",
  });

  return <span style={style}>{props.text}</span>;
};

//  Inter Text Asterisk
export const InterTextAsterisk = ({
  text,
  hasAsterisk = false,
  fontSize,
  ...props
}) => {
  const style = baseTextStyle({
    ...props,
    fontFamily: "Inter",
    fontSize,
  });

  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <span style={style}>{text}</span>

      {hasAsterisk && (
        <span
          style={{
            fontFamily: "Inter",
            fontSize: fontSize || 16,
            fontWeight: 600,
            color: "red",
            marginLeft: 2,
          }}
        >
          *
        </span>
      )}
    </span>
  );
};

//  Poppins Text Asterisk
export const PoppinsTextAsterisk = ({
  text,
  hasAsterisk = false,
  fontSize,
  ...props
}) => {
  const style = baseTextStyle({
    ...props,
    fontFamily: "Poppins",
    fontSize,
  });

  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <span style={style}>{text}</span>

      {hasAsterisk && (
        <span
          style={{
            fontFamily: "Poppins",
            fontSize: fontSize || 16,
            fontWeight: 600,
            color: "red",
            marginLeft: 2,
          }}
        >
          *
        </span>
      )}
    </span>
  );
};

// opensans text
export const OpenSansText = (props) => {
  const style = baseTextStyle({
    ...props,
    fontFamily: "Open Sans",
    fontWeight: props.fontWeight,
    fontSize: props.fontSize,
    fontStyle: props.fontStyle ?? "normal",
    // ❌ REMOVE this line completely
    // fontHeight: props.fontHeight ?? 86,
   
  });

  return (
    <span
      style={{
        ...style,
        whiteSpace: "pre-line",
      }}
    >
      {props.text}
    </span>
  );
};

export const DmSansText = (props) => {
  const style = baseTextStyle({
    ...props,
    fontFamily: "DM Sans",
    fontWeight: props.fontWeight,
    fontSize: props.fontSize,
    fontStyle: props.fontStyle ?? "normal",
    // ❌ REMOVE this line completely
    // fontHeight: props.fontHeight ?? 86,
   
  });

  return (
    <span
      style={{
        ...style,
        whiteSpace: "pre-line",
      }}
    >
      {props.text}
    </span>
  );
};
//  DM Sans Text with Asterisk
export const DMSansTextAsterisk = ({
  text,
  hasAsterisk = false,
  fontSize,
  ...props
}) => {
  const style = baseTextStyle({
    ...props,
    fontFamily: "DM Sans",
    fontWeight: props.fontWeight ?? 600,
    fontSize: fontSize ?? 14,
    fontStyle: props.fontStyle ?? "normal",
    fontHeight: props.fontHeight ?? 1, // 100%
    letterSpacing: props.letterSpacing ?? 0,
  });

  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <span style={style}>{text}</span>

      {hasAsterisk && (
        <span
          style={{
            fontFamily: "DM Sans",
            fontSize: fontSize || 14,
            fontWeight: 600,
            color: "red",
            marginLeft: 2,
          }}
        >
          *
        </span>
      )}
    </span>
  );
};