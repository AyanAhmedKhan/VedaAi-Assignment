"use client";
import type { GeneratedResult } from "@/types/assignment";

function humanizeTypeId(id: string): string {
  const map: Record<string, string> = {
    mcq: "MCQ",
    "true-false": "T/F",
    "fill-blanks": "Fill-Up",
    short: "Short",
    long: "Long",
    diagram: "Diagram",
    numerical: "Numerical",
    "case-study": "Case Study",
    match: "Match",
    essay: "Essay",
  };
  if (map[id]) return map[id];
  if (id.startsWith("custom-")) return "Custom";
  return id;
}

export async function downloadPaperPdf(
  result: GeneratedResult,
  filename = "question-paper.pdf"
) {
  const { Document, Page, Text, View, StyleSheet, pdf } = await import(
    "@react-pdf/renderer"
  );

  const BORDER = "#222";
  const LIGHT = "#999";

  const s = StyleSheet.create({
    page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#111" },
    schoolTitle: {
      fontSize: 16,
      fontWeight: 700,
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    paperTitle: { fontSize: 12, fontWeight: 700, textAlign: "center", marginTop: 2 },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 6,
      fontSize: 10,
    },
    metaRowSub: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 2,
      fontSize: 10,
    },
    metaBold: { fontWeight: 700 },
    bannerRule: {
      borderBottomWidth: 1,
      borderColor: BORDER,
      marginTop: 8,
      marginBottom: 10,
    },
    notesWrap: { flexDirection: "row", marginBottom: 10 },
    notesLabel: { width: 38, fontWeight: 700 },
    notesList: { flex: 1 },
    note: { marginBottom: 1.5, lineHeight: 1.4 },
    studentRow: {
      flexDirection: "row",
      borderWidth: 1,
      borderColor: BORDER,
      marginBottom: 12,
    },
    studentCell: {
      flex: 1,
      padding: 6,
      borderRightWidth: 1,
      borderColor: BORDER,
    },
    studentCellLast: { flex: 1, padding: 6 },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 2,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    sectionMeta: { fontSize: 9, color: "#555" },
    instruction: {
      fontSize: 9.5,
      fontStyle: "italic",
      color: "#444",
      marginBottom: 4,
    },
    table: { borderWidth: 1, borderColor: BORDER, marginBottom: 14, borderRadius: 2 },
    tHeader: { flexDirection: "row", backgroundColor: "#f2f2f2" },
    tHeaderCell: {
      paddingVertical: 5,
      paddingHorizontal: 5,
      fontWeight: 700,
      fontSize: 9,
      textTransform: "uppercase",
      letterSpacing: 0.4,
      borderRightWidth: 1,
      borderColor: BORDER,
    },
    tHeaderLast: {
      paddingVertical: 5,
      paddingHorizontal: 5,
      fontWeight: 700,
      fontSize: 9,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    tRow: { flexDirection: "row", borderTopWidth: 1, borderColor: LIGHT },
    tRowAlt: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderColor: LIGHT,
      backgroundColor: "#fafafa",
    },
    tCell: {
      paddingVertical: 5,
      paddingHorizontal: 5,
      fontSize: 10,
      borderRightWidth: 1,
      borderColor: LIGHT,
    },
    tCellLast: { paddingVertical: 5, paddingHorizontal: 5, fontSize: 10 },
    colNo: { width: 36, textAlign: "center" },
    colQ: { flex: 1 },
    colM: { width: 40, textAlign: "center", fontWeight: 700 },
    colType: { width: 72, textAlign: "center" },
    colDiff: { width: 60, textAlign: "center" },
    diffPill: {
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderWidth: 1,
      borderRadius: 8,
      fontSize: 8.5,
      fontWeight: 700,
      textAlign: "center",
      alignSelf: "center",
    },
    footer: {
      marginTop: 12,
      fontWeight: 700,
      textAlign: "center",
      borderTopWidth: 1,
      borderColor: BORDER,
      paddingTop: 6,
    },
  });

  const diffColors = {
    Easy: { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
    Moderate: { bg: "#fffbeb", color: "#a16207", border: "#fde68a" },
    Hard: { bg: "#fff1f2", color: "#b91c1c", border: "#fecdd3" },
  } as const;

  const doc = (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.schoolTitle}>{result.school || "School"}</Text>
        <Text style={s.paperTitle}>Question Paper</Text>
        <View style={s.metaRow}>
          <Text>
            <Text style={s.metaBold}>Subject: </Text>
            {result.subject}
          </Text>
          <Text>
            <Text style={s.metaBold}>Class: </Text>
            {result.grade}
          </Text>
        </View>
        <View style={s.metaRowSub}>
          <Text>
            <Text style={s.metaBold}>Time Allowed: </Text>
            {result.timeMinutes} minutes
          </Text>
          <Text>
            <Text style={s.metaBold}>Maximum Marks: </Text>
            {result.totalMarks}
          </Text>
        </View>
        <View style={s.bannerRule} />

        <View style={s.notesWrap}>
          <Text style={s.notesLabel}>Note :</Text>
          <View style={s.notesList}>
            <Text style={s.note}>1. Answer all questions. Marks are indicated against each.</Text>
            <Text style={s.note}>2. All sections are compulsory unless stated otherwise.</Text>
            <Text style={s.note}>3. Write answers neatly in the space provided.</Text>
            <Text style={s.note}>4. Assume suitable values for any missing data.</Text>
          </View>
        </View>

        <View style={s.studentRow}>
          <View style={s.studentCell}>
            <Text>Name: _____________________</Text>
          </View>
          <View style={s.studentCell}>
            <Text>Roll No: _______________</Text>
          </View>
          <View style={s.studentCellLast}>
            <Text>Section: ________</Text>
          </View>
        </View>

        {result.sections.map((sec, si) => {
          const total = sec.questions.reduce((sum, q) => sum + q.marks, 0);
          return (
            <View key={si} wrap>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>{sec.title}</Text>
                <Text style={s.sectionMeta}>
                  {sec.questions.length} questions · {total} marks
                </Text>
              </View>
              <Text style={s.instruction}>{sec.instruction}</Text>

              <View style={s.table}>
                <View style={s.tHeader}>
                  <Text style={[s.tHeaderCell, s.colNo]}>No.</Text>
                  <Text style={[s.tHeaderCell, s.colQ]}>Question</Text>
                  <Text style={[s.tHeaderCell, s.colM]}>Marks</Text>
                  <Text style={[s.tHeaderCell, s.colType]}>Type</Text>
                  <Text style={[s.tHeaderLast, s.colDiff]}>Difficulty</Text>
                </View>
                {sec.questions.map((q, qi) => {
                  const rowStyle = qi % 2 === 0 ? s.tRow : s.tRowAlt;
                  const d = diffColors[q.difficulty];
                  return (
                    <View key={qi} style={rowStyle} wrap={false}>
                      <Text style={[s.tCell, s.colNo]}>{qi + 1}</Text>
                      <Text style={[s.tCell, s.colQ]}>{q.text}</Text>
                      <Text style={[s.tCell, s.colM]}>
                        {q.marks.toString().padStart(2, "0")}
                      </Text>
                      <Text style={[s.tCell, s.colType]}>{humanizeTypeId(q.typeId)}</Text>
                      <View style={[s.tCellLast, s.colDiff]}>
                        <Text
                          style={[
                            s.diffPill,
                            { backgroundColor: d.bg, color: d.color, borderColor: d.border },
                          ]}
                        >
                          {q.difficulty}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <Text style={s.footer}>─── End of Question Paper ───</Text>
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
