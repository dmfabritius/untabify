// replace tabs with spaces in a text file
List<string> lines = new List<string>();
List<int> widths = new List<int>();

if (Args.Count < 1) {
    Console.WriteLine("Usage: tabs2spaces filename");
    Environment.Exit(1);
}

using (StreamReader infile = new StreamReader(Args[0])) {
    string line;
    int pos = 0;
    int prev = 0;

    line = infile.ReadLine();
    while ((pos = line.IndexOf("\t", pos + 1)) != -1) widths.Add(0);

    while (line != null) {
        pos = 0;
        prev = 0;
        for (int i = 0; i < widths.Count; i++) {
            pos = line.IndexOf("\t", prev);
            if (pos - prev > widths[i]) widths[i] = pos - prev;
            prev = pos + 1;
            if (prev >= line.Length) break;
        }
        lines.Add(line);
        line = infile.ReadLine();
    }
}

using (StreamWriter outfile = new StreamWriter("[spaced] " + Args[0])) {
    string spaces, result;
    int pos, prev;

    foreach (string line in lines) {
        result = line;
        prev = 0;
        for (int i = 0; i < widths.Count; i++) {
            pos = result.IndexOf("\t");
            if (pos == -1) break;
            prev = prev + widths[i] + 2;
            spaces = new String(' ', prev - pos);
            result = result.Substring(0, pos) + spaces + result.Substring(pos + 1);
        }
        outfile.WriteLine(result);
    }
}
