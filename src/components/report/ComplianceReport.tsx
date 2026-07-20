import React from 'react';
import PageMeta from "@/components/common/PageMeta";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Separator} from "@/components/ui/separator";
import {
    AlertTriangle, Briefcase, Building2, Calendar, CheckCircle2, Cpu,
    Database, FileText, Gavel, Globe, History, Info, LayoutList, Leaf,
    MapPin, Scale, ShieldAlert, ShieldCheck, Users, Wallet,
} from "lucide-react";

interface ReportField {
    icon: string;
    label: string;
    value: string;
}

interface ReportSection {
    title: string;
    fields: ReportField[];
}

export interface ComplianceReportData {
    meta: {title: string; description: string};
    header: {title: string; subtitle: string};
    basicInfo: {
        title: string;
        reportMeta: ReportSection;
        companyBackground: ReportSection;
    };
    aiDiagnosis: {
        title: string;
        overallRisk: {badge: string; level: string; levelKey: string};
        topRisks: {title: string; items: string[]};
        complianceGap: {title: string; summary: string; priorityTitle: string; actions: string[]};
    };
    riskAnalysis: {
        title: string;
        items: Array<{level: string; impact: string; icon: string; action: string; title: string; desc: string}>;
    };
    agencyMatching: {
        title: string;
        columns: string[];
        items: Array<{business: string; advantage: string; name: string}>;
    };
    executionChecklist: {
        title: string;
        items: Array<{date: string; owner: string; warn: string; task: string; material: string}>;
    };
    appendix: {
        title: string;
        copyright: string;
        dataSources: {title: string; text: string};
        lawReferences: {title: string; items: string[]};
        disclaimer: {title: string; items: string[]};
    };
}

interface ComplianceReportProps {
    data: ComplianceReportData;
}

const RISK_LEVELS: Record<string, {label: string; color: string}> = {
    LOW: {label: "低", color: "bg-green-500/10 text-green-600 border-green-200"},
    MEDIUM: {label: "中", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200"},
    HIGH: {label: "高", color: "bg-orange-500/10 text-orange-600 border-orange-200"},
    CRITICAL: {label: "极高", color: "bg-red-500/10 text-red-600 border-red-200"},
};

const ICONS: Record<string, React.ElementType> = {
    AlertTriangle, Briefcase, Building2, Calendar, CheckCircle2, Cpu,
    Database, FileText, Gavel, Globe, History, Info, LayoutList, Leaf,
    MapPin, Scale, ShieldAlert, ShieldCheck, Users, Wallet,
};

const riskLevelBars = Object.entries(RISK_LEVELS).map(([key, value]) => {
    const colors: Record<string, string> = {LOW: 'bg-green-500', MEDIUM: 'bg-yellow-500', HIGH: 'bg-orange-500', CRITICAL: 'bg-red-500'};
    return {key, label: value.label, color: colors[key] ?? 'bg-gray-500'};
});

export default function ComplianceReport({data}: ComplianceReportProps) {
    const d = data;

    return (
        <div className="min-h-screen bg-background text-foreground py-8 md:py-12 px-4">
            <PageMeta title={d.meta.title} description={d.meta.description}/>

            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* Header */}
                <div className="text-center md:text-left space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">{d.header.title}</h1>
                    <p className="text-muted-foreground max-w-2xl text-pretty">{d.header.subtitle}</p>
                </div>

                {/* 1. Basic Info */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary"/>
                            <CardTitle className="text-xl">{d.basicInfo.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[d.basicInfo.reportMeta, d.basicInfo.companyBackground].map((section, si) => (
                                <div key={si} className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</h3>
                                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                                        {section.fields.map((f, i) => {
                                            const I = ICONS[f.icon];
                                            return (
                                                <React.Fragment key={i}>
                                                    <div className="text-muted-foreground flex items-center gap-2">
                                                        {I && <I className="w-4 h-4"/>}{f.label}
                                                    </div>
                                                    <div className="font-medium">{f.value}</div>
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. AI Diagnosis */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <div className="flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-primary"/>
                            <CardTitle className="text-xl">{d.aiDiagnosis.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-muted/30 rounded-lg">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">整体风险等级评估</p>
                                <div className="flex items-center gap-3">
                                    <h4 className="text-3xl font-bold text-orange-600">{d.aiDiagnosis.overallRisk.level}</h4>
                                    <Badge variant="outline" className={RISK_LEVELS[d.aiDiagnosis.overallRisk.levelKey].color}>
                                        {d.aiDiagnosis.overallRisk.badge}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {riskLevelBars.map((bar) => (
                                    <div key={bar.key}
                                         className={`flex flex-col items-center gap-1 ${bar.key === d.aiDiagnosis.overallRisk.levelKey ? 'opacity-100' : 'opacity-40'}`}>
                                        <div className={`w-12 h-2 rounded-full ${bar.color}`}/>
                                        <span className="text-[10px] font-medium">{bar.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-orange-600"/>
                                    <h3 className="font-semibold text-primary">{d.aiDiagnosis.topRisks.title}</h3>
                                </div>
                                <div className="space-y-3">
                                    {d.aiDiagnosis.topRisks.items.map((risk, i) => (
                                        <div key={i} className="flex gap-3 text-sm p-3 bg-white border rounded-md shadow-sm">
                                            <span className="font-bold text-primary">0{i + 1}</span>
                                            <p>{risk}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4 text-primary"/>
                                    <h3 className="font-semibold text-primary">{d.aiDiagnosis.complianceGap.title}</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {d.aiDiagnosis.complianceGap.summary}
                                </p>
                                <div className="p-4 bg-primary/5 rounded-md border border-primary/10">
                                    <p className="text-xs font-bold text-primary uppercase mb-2">{d.aiDiagnosis.complianceGap.priorityTitle}</p>
                                    <ul className="text-sm space-y-1 list-disc list-inside">
                                        {d.aiDiagnosis.complianceGap.actions.map((a, i) => (
                                            <li key={i}>{a}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Risk Analysis */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <LayoutList className="w-5 h-5 text-primary"/>
                        <h2 className="text-2xl font-bold text-primary">{d.riskAnalysis.title}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {d.riskAnalysis.items.map((item, i) => {
                            const I = ICONS[item.icon];
                            return (
                                <Card key={i} className="border-none shadow-sm flex flex-col">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {I && <I className="w-5 h-5 text-primary"/>}
                                                <CardTitle className="text-lg">{item.title}</CardTitle>
                                            </div>
                                            <Badge variant="outline" className={RISK_LEVELS[item.level].color}>
                                                {RISK_LEVELS[item.level].label}风险
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-4 flex-1">
                                        <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                                        <div className="space-y-2 pt-2 border-t border-muted">
                                            <div className="flex gap-2">
                                                <span className="font-semibold text-primary shrink-0">风险影响:</span>
                                                <span>{item.impact}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="font-semibold text-primary shrink-0">应对建议:</span>
                                                <span>{item.action}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Agency Matching */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary"/>
                            <CardTitle className="text-xl">{d.agencyMatching.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        {d.agencyMatching.columns.map((col, i) => (
                                            <TableHead key={i} className={i === 2 ? 'whitespace-nowrap' : `w-[${i === 0 ? 200 : 250}px] whitespace-nowrap`}>
                                                {col}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {d.agencyMatching.items.map((org, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-semibold whitespace-nowrap">{org.name}</TableCell>
                                            <TableCell className="text-sm whitespace-nowrap">{org.business}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{org.advantage}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Execution Checklist */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary"/>
                            <CardTitle className="text-xl">{d.executionChecklist.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {d.executionChecklist.items.map((item, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-white relative">
                                    <div className="md:w-32 shrink-0">
                                        <Badge className="bg-primary text-white mb-2">{item.date}</Badge>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Users className="w-3 h-3"/> {item.owner}
                                        </p>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h4 className="font-bold text-primary">{item.task}</h4>
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">办理材料：</span>
                                            <span>{item.material}</span>
                                        </div>
                                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-md">
                                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5"/>
                                            <p className="text-xs text-red-700">{item.warn}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Appendix */}
                <Card className="border-none shadow-sm bg-muted/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary"/>
                            <CardTitle className="text-xl">{d.appendix.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                                    <Gavel className="w-4 h-4"/> {d.appendix.lawReferences.title}
                                </h3>
                                <ul className="text-xs space-y-2 text-muted-foreground list-decimal list-inside">
                                    {d.appendix.lawReferences.items.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                                    <Database className="w-4 h-4"/> {d.appendix.dataSources.title}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {d.appendix.dataSources.text}
                                </p>
                            </div>
                        </div>

                        <Separator className="bg-muted-foreground/20"/>

                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                                <Scale className="w-4 h-4"/> {d.appendix.disclaimer.title}
                            </h3>
                            <p className="text-[10px] text-muted-foreground leading-relaxed text-pretty">
                                {d.appendix.disclaimer.items.map((item, i) => (
                                    <React.Fragment key={i}>{i + 1}. {item}<br/></React.Fragment>
                                ))}
                            </p>
                        </div>

                        <div className="pt-4 text-center">
                            <p className="text-[10px] text-muted-foreground">{d.appendix.copyright}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
