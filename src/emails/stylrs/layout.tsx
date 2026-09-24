import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export function EmailLayout({
  previewText,
  heading,
  children,
}: {
  previewText: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "sans-serif", padding: "24px 0" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            padding: "32px",
            maxWidth: 480,
          }}
        >
          <Heading as="h2" style={{ fontSize: 20, marginBottom: 16 }}>
            {heading}
          </Heading>
          <Section>{children}</Section>
          <Text style={{ fontSize: 12, color: "#71717a", marginTop: 32 }}>
            Verstuurd via STYLRS
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Text style={{ fontSize: 14, margin: "4px 0" }}>
      <strong>{label}:</strong> {value}
    </Text>
  );
}
