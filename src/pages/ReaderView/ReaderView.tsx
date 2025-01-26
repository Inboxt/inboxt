import {
	Anchor,
	Box,
	Center,
	Divider,
	Group,
	Stack,
	Text,
	Title,
	TypographyStylesProvider,
} from '@mantine/core';
import { AppName } from '../../components/AppName';

import classes from './ReaderView.module.css';

import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';
import { ReaderSettingsOptions } from '../../components/ReaderSettingsOptions';
import { useNavigate } from '@tanstack/react-router';
import { Route } from '../../routes/$id.tsx';
import { AppViews } from '../../constants';

const _PARSED_FROM_BACKEND = {
	title: 'Rubber duck debugging',
	content:
		'<div><div id="mw-content-text" class="mw-body-content"><div class="mw-content-ltr mw-parser-output"><section class="mf-section-0" id="mf-section-0">\n\n<p>In <a href="https://en.m.wikipedia.org/wiki/Software_engineering">software engineering</a>, <b>rubber duck debugging</b> (or <b>rubberducking</b>) is a method of <a href="https://en.m.wikipedia.org/wiki/Debugging">debugging</a> code by articulating a problem in spoken or written <a href="https://en.m.wikipedia.org/wiki/Natural_language">natural language</a>. The name is a reference to a story in the book <i><a href="https://en.m.wikipedia.org/wiki/The_Pragmatic_Programmer">The Pragmatic Programmer</a></i> in which a programmer would carry around a <a href="https://en.m.wikipedia.org/wiki/Rubber_duck">rubber duck</a> and debug their code by forcing themselves to explain it, line by line, to the duck.<sup id="cite_ref-pragprog_1-0" class="reference"><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_note-pragprog-1"><span class="cite-bracket">[</span>1<span class="cite-bracket">]</span></a></sup> Many other terms exist for this technique, often involving different (usually) inanimate objects, or pets such as a dog or a cat. <a href="https://en.m.wikipedia.org/wiki/Teddy_bears" class="mw-redirect">Teddy bears</a> are also widely used.<sup id="cite_ref-2" class="reference"><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_note-2"><span class="cite-bracket">[</span>2<span class="cite-bracket">]</span></a></sup>\n</p><figure class="mw-default-size"><a href="https://en.m.wikipedia.org/wiki/File:Rubber_duck_assisting_with_debugging.jpg" class="mw-file-description"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rubber_duck_assisting_with_debugging.jpg/220px-Rubber_duck_assisting_with_debugging.jpg" width="220" height="220" class="mw-file-element" srcset="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rubber_duck_assisting_with_debugging.jpg/330px-Rubber_duck_assisting_with_debugging.jpg 1.5x, https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rubber_duck_assisting_with_debugging.jpg/440px-Rubber_duck_assisting_with_debugging.jpg 2x"></a><figcaption>A <a href="https://en.m.wikipedia.org/wiki/Rubber_duck">rubber duck</a> in use by a developer to aid debugging</figcaption></figure>\n\n\n\n</section><div class="mw-heading mw-heading2 section-heading"><span class="indicator mf-icon mf-icon-expand mf-icon--small"></span>\n\n</div><section class="mf-section-1 collapsible-block" id="mf-section-1">\n<p>Many programmers have had the experience of explaining a problem to someone else, possibly even to someone who knows nothing about programming, and then hitting upon the solution in the process of explaining the problem. In describing what the code is supposed to do and observing what it actually does, any incongruity between these two becomes apparent.<sup id="cite_ref-cardboarddog_3-0" class="reference"><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_note-cardboarddog-3"><span class="cite-bracket">[</span>3<span class="cite-bracket">]</span></a></sup> More generally, teaching a subject forces its evaluation from different perspectives and <a href="https://en.m.wikipedia.org/wiki/Learning_by_teaching">can provide a deeper understanding</a>.<sup id="cite_ref-4" class="reference"><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_note-4"><span class="cite-bracket">[</span>4<span class="cite-bracket">]</span></a></sup> By using an inanimate object, the programmer can try to accomplish this without having to interrupt anyone else, and with better results than have been observed from merely thinking aloud without an audience.<sup id="cite_ref-5" class="reference"><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_note-5"><span class="cite-bracket">[</span>5<span class="cite-bracket">]</span></a></sup> This approach has been taught in <a href="https://en.m.wikipedia.org/wiki/Computer_science">computer science</a> and software engineering courses.<sup id="cite_ref-6" class="reference"><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_note-6"><span class="cite-bracket">[</span>6<span class="cite-bracket">]</span></a></sup><sup id="cite_ref-7" class="reference"><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_note-7"><span class="cite-bracket">[</span>7<span class="cite-bracket">]</span></a></sup>\n</p>\n</section><div class="mw-heading mw-heading2 section-heading"><span class="indicator mf-icon mf-icon-expand mf-icon--small"></span>\n\n</div><section class="mf-section-2 collapsible-block" id="mf-section-2">\n<p>On 1 April 2018, <a href="https://en.m.wikipedia.org/wiki/Stack_Exchange">Stack Exchange</a> introduced a rubber duck avatar on their websites as a new &quot;feature&quot; called <i>Quack Overflow</i> as an <a href="https://en.m.wikipedia.org/wiki/April_Fools%27_Day">April Fools&apos; Day</a> joke. The duck appeared at the bottom right corner of the browser <a href="https://en.m.wikipedia.org/wiki/Viewport">viewport</a>, and attempted to help visitors by listening to their problems and responding with solutions. However, the duck merely produced a <a href="https://en.m.wikipedia.org/wiki/Quack_(sound)" class="mw-redirect">quack</a> sound after apparently thinking and typing. It referenced <i>rubber ducking</i> as a powerful method for solving problems.<sup id="cite_ref-8" class="reference"><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_note-8"><span class="cite-bracket">[</span>8<span class="cite-bracket">]</span></a></sup>\n</p>\n</section><div class="mw-heading mw-heading2 section-heading"><span class="indicator mf-icon mf-icon-expand mf-icon--small"></span>\n\n</div><section class="mf-section-3 collapsible-block" id="mf-section-3">\n<ul class="noprint portalbox portalborder portalright">\n<li class="portalbox-entry"><span class="portalbox-image"><span class="noviewer"><a href="https://en.m.wikipedia.org/wiki/File:Octicons-terminal.svg" class="mw-file-description"><span class="lazy-image-placeholder">&#xA0;</span></a></span></span><span class="portalbox-link"><a href="https://en.m.wikipedia.org/wiki/Portal:Computer_programming">Computer programming portal</a></span></li></ul>\n<ul><li><a href="https://en.m.wikipedia.org/wiki/Code_review">Code review</a></li>\n<li><a href="https://en.m.wikipedia.org/wiki/Pair_programming">Pair programming</a></li>\n<li><a href="https://en.m.wikipedia.org/wiki/Socratic_method">Socratic method</a></li>\n<li><a href="https://en.m.wikipedia.org/wiki/Desk_checking" class="mw-redirect">Desk checking</a></li>\n<li><a href="https://en.m.wikipedia.org/wiki/Duck_test">Duck test</a></li>\n<li><a href="https://en.m.wikipedia.org/wiki/Duck_typing">Duck typing</a></li>\n<li><a href="https://en.m.wikipedia.org/wiki/Software_walkthrough">Software walkthrough</a></li>\n<li><a href="https://en.m.wikipedia.org/wiki/Eureka_effect#The_Aha!_effect_and_scientific_discovery">Eureka effect &#xA7;&#xA0;The Aha! effect and scientific discovery</a></li>\n<li><a href="https://en.m.wikipedia.org/wiki/Think_aloud_protocol">Think aloud protocol</a></li>\n<li><a href="https://en.m.wikipedia.org/wiki/Pointing_and_calling">Pointing and calling</a></li>\n<li><a href="https://en.m.wikipedia.org/wiki/Rogerian_method" class="mw-redirect">Rogerian method</a></li>\n<li><a href="https://en.m.wikipedia.org/wiki/Worry_dolls" class="mw-redirect">Worry dolls</a></li>\n<li><a href="https://en.m.wikipedia.org/wiki/Learning_by_teaching">Learning by teaching</a></li>\n<li><a href="https://en.m.wikipedia.org/wiki/Body_doubling">Body doubling</a></li></ul>\n</section><div class="mw-heading mw-heading2 section-heading"><span class="indicator mf-icon mf-icon-expand mf-icon--small"></span>\n\n</div><section class="mf-section-4 collapsible-block" id="mf-section-4">\n<div class="reflist">\n<div class="mw-references-wrap"><ol class="references">\n<li id="cite_note-pragprog-1"><span class="mw-cite-backlink"><b><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_ref-pragprog_1-0">^</a></b></span> <span class="reference-text"><cite id="CITEREFHuntThomas1999" class="citation book cs1">Hunt, Andrew; Thomas, David (1999). <span class="id-lock-registration"><a class="external text" href="https://archive.org/details/isbn_9780201616224"><i>The Pragmatic Programmer: From Journeyman to Master</i></a></span>. Addison Wesley. <a href="https://en.m.wikipedia.org/wiki/ISBN_(identifier)" class="mw-redirect">ISBN</a>&#xA0;<a href="https://en.m.wikipedia.org/wiki/Special:BookSources/978-0201616224"><bdi>978-0201616224</bdi></a>.</cite><span class="Z3988"></span> p. 95, footnote.</span>\n</li>\n<li id="cite_note-2"><span class="mw-cite-backlink"><b><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_ref-2">^</a></b></span> <span class="reference-text"><cite id="CITEREFDebugging" class="citation web cs1">Debugging, Rubber Duck. <a class="external text" href="https://rubberduckdebugging.com/">&quot;Rubber Duck Debugging&quot;</a>. <i>rubberduckdebugging.com</i>. <a class="external text" href="https://web.archive.org/web/20201112022638/http://rubberduckdebugging.com/">Archived</a> from the original on 12 November 2020<span class="reference-accessdate">. Retrieved <span class="nowrap">14 September</span> 2023</span>.</cite><span class="Z3988"></span></span>\n</li>\n<li id="cite_note-cardboarddog-3"><span class="mw-cite-backlink"><b><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_ref-cardboarddog_3-0">^</a></b></span> <span class="reference-text"><cite id="CITEREFBaker" class="citation cs2">Baker, SJ, <a class="external text" href="http://www.sjbaker.org/humor/cardboard_dog.html"><i>The Contribution of the Cardboard Cutout Dog to Software Reliability and Maintainability</i></a>, <a class="external text" href="https://web.archive.org/web/20131005123545/http://www.sjbaker.org/humor/cardboard_dog.html">archived</a> from the original on 5 October 2013<span class="reference-accessdate">, retrieved <span class="nowrap">9 February</span> 2011</span></cite><span class="Z3988"></span>.</span>\n</li>\n<li id="cite_note-4"><span class="mw-cite-backlink"><b><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_ref-4">^</a></b></span> <span class="reference-text"><cite id="CITEREFHayes2014" class="citation web cs1">Hayes, David (25 June 2014). <a class="external text" href="https://web.archive.org/web/20140709011039/http://pressupinc.com/blog/2014/06/psychology-underlying-power-rubber-duck-debugging/">&quot;The Psychology Underlying the Power of Rubber Duck Debugging&quot;</a>. <i>Press Up via Internet Archive</i>. Archived from <a class="external text" href="http://pressupinc.com/blog/2014/06/psychology-underlying-power-rubber-duck-debugging/">the original</a> on 9 July 2014<span class="reference-accessdate">. Retrieved <span class="nowrap">10 September</span> 2021</span>.</cite><span class="Z3988"></span></span>\n</li>\n<li id="cite_note-5"><span class="mw-cite-backlink"><b><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_ref-5">^</a></b></span> <span class="reference-text"><cite id="CITEREFByrdJosephGongoraSirota2023" class="citation journal cs1">Byrd, Nick; Joseph, Brianna; Gongora, Gabriela; Sirota, Miroslav (2023). <a class="external text" href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10146599">&quot;Tell Us What You Really Think: A Think Aloud Protocol Analysis of the Verbal Cognitive Reflection Test&quot;</a>. <i>Journal of Intelligence</i>. <b>11</b> (4): 76. <a href="https://en.m.wikipedia.org/wiki/Doi_(identifier)" class="mw-redirect">doi</a>:<span class="id-lock-free"><a class="external text" href="https://doi.org/10.3390%2Fjintelligence11040076">10.3390/jintelligence11040076</a></span>. <a href="https://en.m.wikipedia.org/wiki/PMC_(identifier)" class="mw-redirect">PMC</a>&#xA0;<span class="id-lock-free"><a class="external text" href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10146599">10146599</a></span>. <a href="https://en.m.wikipedia.org/wiki/PMID_(identifier)" class="mw-redirect">PMID</a>&#xA0;<a class="external text" href="https://pubmed.ncbi.nlm.nih.gov/37103261">37103261</a>.</cite><span class="Z3988"></span></span>\n</li>\n<li id="cite_note-6"><span class="mw-cite-backlink"><b><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_ref-6">^</a></b></span> <span class="reference-text"><cite id="CITEREFAttwood2012" class="citation web cs1"><a href="https://en.m.wikipedia.org/wiki/Jeff_Atwood">Attwood, Jeff</a> (2012). <a class="external text" href="https://blog.codinghorror.com/rubber-duck-problem-solving/">&quot;Rubber Duck Problem Solving&quot;</a>. <i>codinghorror.com</i>. <a class="external text" href="https://web.archive.org/web/20220212144738/https://blog.codinghorror.com/rubber-duck-problem-solving/">Archived</a> from the original on 12 February 2022<span class="reference-accessdate">. Retrieved <span class="nowrap">16 November</span> 2021</span>.</cite><span class="Z3988"></span></span>\n</li>\n<li id="cite_note-7"><span class="mw-cite-backlink"><b><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_ref-7">^</a></b></span> <span class="reference-text"><cite id="CITEREFMalan2020" class="citation web cs1"><a href="https://en.m.wikipedia.org/wiki/David_J._Malan">Malan, David</a> (2020). <a class="external text" href="https://cs50.noticeable.news/posts/rubber-duck-debugging-in-cs-50-ide">&quot;Rubber Duck Debugging in CS50 IDE&quot;</a>. <i>noticeable.news</i>.</cite><span class="Z3988"></span></span>\n</li>\n<li id="cite_note-8"><span class="mw-cite-backlink"><b><a href="https://en.m.wikipedia.org/wiki/Rubber_duck_debugging#cite_ref-8">^</a></b></span> <span class="reference-text"><cite class="citation web cs1"><a class="external text" href="https://meta.stackexchange.com/a/308578">&quot;Stack Exchange has been taken over by a rubber duck!&quot;</a>. <i>Meta Stack Exchange</i>. 31 March 2018<span class="reference-accessdate">. Retrieved <span class="nowrap">1 April</span> 2018</span>.</cite><span class="Z3988"></span></span>\n</li>\n</ol></div></div>\n</section><div class="mw-heading mw-heading2 section-heading"><span class="indicator mf-icon mf-icon-expand mf-icon--small"></span>\n\n</div><section class="mf-section-5 collapsible-block" id="mf-section-5">\n<div class="side-box side-box-right plainlinks sistersitebox">\n<div class="side-box-flex">\n<div class="side-box-image"><span class="noviewer"><a href="https://en.m.wikipedia.org/wiki/File:Commons-logo.svg" class="mw-file-description"><span class="lazy-image-placeholder">&#xA0;</span></a></span></div>\n<div class="side-box-text plainlist">Wikimedia Commons has media related to <span><a href="https://commons.wikimedia.org/wiki/Category:Rubber_duck_debugging" class="extiw">Rubber duck debugging</a></span>.</div></div>\n</div>\n<ul><li><a class="external text" href="https://rubberduckdebugging.com/">Rubber Duck Debugging</a></li></ul>\n\n\n\n\n</section></div>\n\n<div class="printfooter">Retrieved from &quot;<a href="https://en.wikipedia.org/w/index.php?title=Rubber_duck_debugging&amp;oldid=1268801328">https://en.wikipedia.org/w/index.php?title=Rubber_duck_debugging&amp;oldid=1268801328</a>&quot;</div></div></div>',
	author: 'Wikipedia Contributors',
	date_published: '2025-01-11T15:45:00.000Z',
	lead_image_url:
		'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rubber_duck_assisting_with_debugging.jpg/220px-Rubber_duck_assisting_with_debugging.jpg',
	dek: null,
	next_page_url: null,
	url: 'https://en.wikipedia.org/wiki/Rubber_duck_debugging',
	domain: 'en.wikipedia.org',
	excerpt:
		'In software engineering, rubber duck debugging (or rubberducking) is a method of debugging code by articulating a problem in spoken or written natural language. The name is a reference to a story in&hellip;',
	word_count: 545,
	direction: 'ltr',
	total_pages: 1,
	rendered_pages: 1,
}; // todo: from backend :)

export const ReaderView = () => {
	const isAboveXsScreen = useScreenQuery('xs', 'above');
	const navigate = useNavigate({ from: Route.fullPath });

	return (
		<Box py="md" px={isAboveXsScreen ? 24 : 'md'} pb="xxl">
			<Box className={classes.headerContainer}>
				<Box
					onClick={() =>
						void navigate({
							to: '/',
							search: { view: AppViews.INBOX },
						})
					}
				>
					<AppName
						size="md"
						variant={isAboveXsScreen ? 'full' : 'short'}
					/>
				</Box>

				<Box hiddenFrom="md">
					<ReaderSettingsOptions direction="row" variant="menu" />
				</Box>
			</Box>

			<Box visibleFrom="md" className={classes.readerSettingsContainer}>
				<ReaderSettingsOptions />
			</Box>

			<Center py="md">
				<Box w={isAboveXsScreen ? '45em' : '100%'}>
					<Stack gap="xl">
						<Stack gap="xxs">
							<Group gap={6}>
								<Text>August 30, 2024</Text>
								<Text>•</Text>
								<Text>7 min read</Text>
							</Group>

							<Title order={2}>
								{_PARSED_FROM_BACKEND.title}
							</Title>

							<Group gap={6}>
								<Text>{`By ${_PARSED_FROM_BACKEND.author},`}</Text>
								<Text>{_PARSED_FROM_BACKEND.domain}</Text>
								<Text>•</Text>
								<Anchor href={_PARSED_FROM_BACKEND.url}>
									See original
								</Anchor>
							</Group>
						</Stack>

						<Divider />

						<TypographyStylesProvider
							style={{
								wordBreak: 'break-word',
							}}
						>
							<div
								dangerouslySetInnerHTML={{
									__html: _PARSED_FROM_BACKEND.content,
								}}
							/>
						</TypographyStylesProvider>
					</Stack>
				</Box>
			</Center>
		</Box>
	);
};
